import pytest
import json
from app import app

def test_game_flow_integration(client, auth_headers):
    """Test complete game flow integration"""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Windsurf vs All' in response.data
    
    response = client.get('/game_state', headers=auth_headers)
    assert response.status_code == 200
    assert response.json['status'] == 'ok'
    
    player_data = {
        'player_id': '123',
        'x': 100,
        'y': 100,
        'score': 150
    }
    response = client.post('/update_player',
                         json=player_data,
                         headers=auth_headers)
    assert response.status_code == 200
    assert response.json['status'] == 'ok'

def test_authentication_flow(client):
    """Test authentication flow for protected endpoints"""
    response = client.get('/game_state')
    assert response.status_code == 401
    
    response = client.post('/update_player', json={'player_id': '123'})
    assert response.status_code == 401
    
    wrong_auth = {'Authorization': 'Basic d3JvbmctY3JlZHM='}  # wrong-creds
    response = client.get('/game_state', headers=wrong_auth)
    assert response.status_code == 401
    
    response = client.post('/update_player', 
                         json={'player_id': '123'}, 
                         headers=wrong_auth)
    assert response.status_code == 401

def test_input_validation_flow(client, auth_headers):
    """Test input validation across different scenarios"""
    invalid_inputs = [
        None,
        {},
        {'no_player_id': 'value'},
        {'player_id': '123', 'data': 'x' * 1000}  # Too large
    ]
    
    expected_status_codes = [400, 400, 400, 413]
    
    for i, invalid_input in enumerate(invalid_inputs):
        if invalid_input is None:
            headers = {**auth_headers, 'Content-Type': 'application/json'}
            response = client.post('/update_player', headers=headers)
        else:
            response = client.post('/update_player',
                                 json=invalid_input,
                                 headers=auth_headers)
        assert response.status_code == expected_status_codes[i]
    
    valid_input = {'player_id': '123', 'x': 50, 'y': 75}
    response = client.post('/update_player',
                         json=valid_input,
                         headers=auth_headers)
    assert response.status_code == 200
