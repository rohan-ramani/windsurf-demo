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
