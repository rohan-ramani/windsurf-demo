import json
import pytest

def test_full_game_flow_integration(client):
    """Test the complete game flow without mocks."""
    # Test that index page loads
    response = client.get('/')
    assert response.status_code == 200
    
    # Test that endpoints require authentication
    response = client.get('/game_state')
    assert response.status_code == 401
    
    # Simulate authentication
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    # Test authenticated access
    response = client.get('/game_state')
    assert response.status_code == 200
    assert response.get_json()['status'] == 'ok'
    
    # Test player update with valid data
    response = client.post('/update_player', json={'x': 500, 'y': 500})
    assert response.status_code == 200
    assert response.get_json()['status'] == 'ok'

def test_security_integration(client):
    """Test security features work together."""
    # Test security headers are applied to all routes
    response = client.get('/')
    assert 'X-Content-Type-Options' in response.headers
    
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    response = client.get('/game_state')
    assert 'X-Frame-Options' in response.headers
    
    response = client.post('/update_player', json={'x': 100, 'y': 100})
    assert 'Content-Security-Policy' in response.headers
