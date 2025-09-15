import json
import pytest

def test_game_initialization_flow(client, auth_headers):
    """Test the complete game initialization flow."""
    response = client.get('/')
    assert response.status_code == 200
    assert b'gameCanvas' in response.data
    
    response = client.get('/game_state', headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'

def test_player_movement_flow(client, auth_headers):
    """Test the player movement update flow."""
    positions = [
        {'x': 100, 'y': 100},
        {'x': 150, 'y': 120},
        {'x': 200, 'y': 180},
    ]
    
    for pos in positions:
        response = client.post('/update_player', 
                              json=pos, 
                              headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'ok'
        assert data['x'] == pos['x']
        assert data['y'] == pos['y']

def test_authentication_flow(client):
    """Test the complete authentication flow for API endpoints."""
    protected_endpoints = [
        ('GET', '/game_state'),
        ('POST', '/update_player', {'x': 100, 'y': 100}),
    ]
    
    for method, endpoint, *json_data in protected_endpoints:
        if method == 'GET':
            response = client.get(endpoint)
        else:
            response = client.post(endpoint, json=json_data[0] if json_data else None)
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['error'] == 'Invalid API key'
    
    auth_headers = {'X-API-Key': 'test-api-key'}
    
    response = client.get('/game_state', headers=auth_headers)
    assert response.status_code == 200
    
    response = client.post('/update_player', 
                          json={'x': 100, 'y': 100}, 
                          headers=auth_headers)
    assert response.status_code == 200

def test_input_validation_flow(client, auth_headers):
    """Test the complete input validation flow."""
    invalid_inputs = [
        None,  # No JSON
        {},  # Empty JSON
        {'x': 'invalid'},  # Invalid x type
        {'y': 'invalid'},  # Invalid y type
        {'x': 'invalid', 'y': 'invalid'},  # Both invalid
    ]
    
    for invalid_input in invalid_inputs:
        if invalid_input is None:
            response = client.post('/update_player', headers=auth_headers)
        else:
            response = client.post('/update_player', 
                                  json=invalid_input, 
                                  headers=auth_headers)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    response = client.post('/update_player', 
                          json={'x': 100, 'y': 200}, 
                          headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'

def test_boundary_validation_flow(client, auth_headers):
    """Test coordinate boundary validation across the full range."""
    test_cases = [
        {'input': {'x': -100, 'y': -100}, 'expected': {'x': 0, 'y': 0}},
        {'input': {'x': 0, 'y': 0}, 'expected': {'x': 0, 'y': 0}},
        {'input': {'x': 1000, 'y': 1000}, 'expected': {'x': 1000, 'y': 1000}},
        {'input': {'x': 2000, 'y': 2000}, 'expected': {'x': 2000, 'y': 2000}},
        {'input': {'x': 3000, 'y': 3000}, 'expected': {'x': 2000, 'y': 2000}},
    ]
    
    for case in test_cases:
        response = client.post('/update_player', 
                              json=case['input'], 
                              headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['x'] == case['expected']['x']
        assert data['y'] == case['expected']['y']
