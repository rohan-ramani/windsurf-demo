import json
import pytest

def test_index_route(client):
    """Test the main index route returns the game template."""
    response = client.get('/')
    assert response.status_code == 200

def test_game_state_requires_auth(client):
    """Test that game_state endpoint requires authentication."""
    response = client.get('/game_state')
    assert response.status_code == 401
    assert 'Authentication required' in response.get_json()['error']

def test_update_player_requires_auth(client):
    """Test that update_player endpoint requires authentication."""
    response = client.post('/update_player', json={'x': 100, 'y': 100})
    assert response.status_code == 401

def test_update_player_validates_content_type(client):
    """Test that update_player validates JSON content type."""
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    response = client.post('/update_player', data='not json')
    assert response.status_code == 400
    assert 'Content-Type must be application/json' in response.get_json()['error']

def test_update_player_validates_coordinates(client):
    """Test coordinate validation in update_player."""
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    # Test missing coordinates
    response = client.post('/update_player', json={})
    assert response.status_code == 400
    
    # Test invalid coordinate types
    response = client.post('/update_player', json={'x': 'invalid', 'y': 100})
    assert response.status_code == 400
    
    # Test out of bounds coordinates
    response = client.post('/update_player', json={'x': -10, 'y': 100})
    assert response.status_code == 400
    
    response = client.post('/update_player', json={'x': 3000, 'y': 100})
    assert response.status_code == 400
    
    # Test valid coordinates
    response = client.post('/update_player', json={'x': 100, 'y': 100})
    assert response.status_code == 200
    assert response.get_json()['status'] == 'ok'

def test_security_headers(client):
    """Test that security headers are present."""
    response = client.get('/')
    assert response.headers.get('X-Content-Type-Options') == 'nosniff'
    assert response.headers.get('X-Frame-Options') == 'DENY'
    assert response.headers.get('X-XSS-Protection') == '1; mode=block'
    assert 'Content-Security-Policy' in response.headers

def test_authentication_bypass_attempts(client):
    """Test various authentication bypass scenarios."""
    # Test with invalid session data (non-boolean)
    with client.session_transaction() as sess:
        sess['authenticated'] = 'invalid'
    response = client.get('/game_state')
    assert response.status_code == 200  # 'invalid' is truthy in Python
    
    # Test with False authentication
    with client.session_transaction() as sess:
        sess['authenticated'] = False
    response = client.get('/game_state')
    assert response.status_code == 401
    
    # Test with missing session
    with client.session_transaction() as sess:
        sess.clear()
    response = client.get('/game_state')
    assert response.status_code == 401

def test_input_validation_edge_cases(client):
    """Test comprehensive input validation scenarios."""
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    # Test with extremely large coordinates
    response = client.post('/update_player', json={'x': 999999999, 'y': 100})
    assert response.status_code == 400
    
    # Test with negative coordinates
    response = client.post('/update_player', json={'x': -1, 'y': -1})
    assert response.status_code == 400
    
    response = client.post('/update_player', json={'x': 0.0, 'y': 2000.0})
    assert response.status_code == 200
    
    response = client.post('/update_player', json={'x': None, 'y': 100})
    assert response.status_code == 400
    
    response = client.post('/update_player', json={'y': 100})
    assert response.status_code == 400
    
    response = client.post('/update_player', json={'x': 100, 'y': 100, 'malicious': 'data'})
    assert response.status_code == 200

def test_http_methods_security(client):
    """Test that endpoints only accept intended HTTP methods."""
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    response = client.get('/update_player')
    assert response.status_code == 405
    
    response = client.put('/game_state')
    assert response.status_code == 405
    
    response = client.delete('/update_player')
    assert response.status_code == 405

def test_content_type_security(client):
    """Test content type validation and security."""
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    response = client.post('/update_player', 
                          data='<xml>test</xml>', 
                          content_type='application/xml')
    assert response.status_code == 400
    
    response = client.post('/update_player', 
                          data={'x': '100', 'y': '100'}, 
                          content_type='application/x-www-form-urlencoded')
    assert response.status_code == 400

def test_session_management_edge_cases(client):
    """Test session management security."""
    with client.session_transaction() as sess:
        sess['authenticated'] = True
        sess['user_id'] = 'test_user'
    
    response = client.get('/game_state')
    assert response.status_code == 200
    
    with client.session_transaction() as sess:
        sess['authenticated'] = False
    
    response = client.get('/game_state')
    assert response.status_code == 401

def test_coordinate_boundary_validation(client):
    """Test coordinate boundary validation thoroughly."""
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    response = client.post('/update_player', json={'x': 0, 'y': 0})
    assert response.status_code == 200
    
    response = client.post('/update_player', json={'x': 2000, 'y': 2000})
    assert response.status_code == 200
    
    response = client.post('/update_player', json={'x': -0.1, 'y': 100})
    assert response.status_code == 400
    
    response = client.post('/update_player', json={'x': 100, 'y': 2000.1})
    assert response.status_code == 400
