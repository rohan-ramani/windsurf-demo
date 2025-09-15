import json
import pytest

def test_index_route(client):
    """Test the main index route returns the game HTML."""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Windsurf vs All' in response.data

def test_game_state_without_auth(client):
    """Test game_state endpoint requires authentication."""
    response = client.get('/game_state')
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['error'] == 'Invalid API key'

def test_game_state_with_invalid_auth(client, invalid_auth_headers):
    """Test game_state endpoint rejects invalid API key."""
    response = client.get('/game_state', headers=invalid_auth_headers)
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['error'] == 'Invalid API key'

def test_game_state_with_valid_auth(client, auth_headers):
    """Test game_state endpoint works with valid authentication."""
    response = client.get('/game_state', headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'

def test_update_player_without_auth(client):
    """Test update_player endpoint requires authentication."""
    response = client.post('/update_player', 
                          json={'x': 100, 'y': 200})
    assert response.status_code == 401

def test_update_player_with_invalid_auth(client, invalid_auth_headers):
    """Test update_player endpoint rejects invalid API key."""
    response = client.post('/update_player', 
                          json={'x': 100, 'y': 200},
                          headers=invalid_auth_headers)
    assert response.status_code == 401

def test_update_player_no_json(client, auth_headers):
    """Test update_player endpoint validates JSON data presence."""
    response = client.post('/update_player', headers=auth_headers)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['error'] == 'No JSON data provided'

def test_update_player_invalid_coordinates(client, auth_headers):
    """Test update_player endpoint validates coordinate data types."""
    response = client.post('/update_player', 
                          json={}, 
                          headers=auth_headers)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['error'] == 'Invalid coordinates'
    
    response = client.post('/update_player', 
                          json={'x': 'invalid', 'y': 200}, 
                          headers=auth_headers)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['error'] == 'Invalid coordinates'

def test_update_player_valid_coordinates(client, auth_headers):
    """Test update_player endpoint accepts valid coordinates."""
    response = client.post('/update_player', 
                          json={'x': 100, 'y': 200}, 
                          headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'
    assert data['x'] == 100
    assert data['y'] == 200

def test_update_player_coordinate_bounds(client, auth_headers):
    """Test update_player endpoint sanitizes coordinates within world bounds."""
    response = client.post('/update_player', 
                          json={'x': -100, 'y': 3000}, 
                          headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['x'] == 0  # Clamped to minimum
    assert data['y'] == 2000  # Clamped to WORLD_SIZE maximum

def test_update_player_float_coordinates(client, auth_headers):
    """Test update_player endpoint accepts float coordinates."""
    response = client.post('/update_player', 
                          json={'x': 100.5, 'y': 200.7}, 
                          headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['x'] == 100.5
    assert data['y'] == 200.7

def test_security_headers_present(client):
    """Test that security headers are present in responses."""
    response = client.get('/')
    assert 'X-Frame-Options' in response.headers
    assert 'X-Content-Type-Options' in response.headers
