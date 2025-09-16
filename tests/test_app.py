import pytest
import json
from app import app

def test_index_route(client):
    """Test that the index route returns the game page"""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Windsurf vs All' in response.data

def test_game_state_requires_auth(client):
    """Test that game_state endpoint requires authentication"""
    response = client.get('/game_state')
    assert response.status_code == 401
    assert response.json['error'] == 'Authentication required'

def test_game_state_with_auth(client, auth_headers):
    """Test that game_state endpoint works with proper authentication"""
    response = client.get('/game_state', headers=auth_headers)
    assert response.status_code == 200
    assert response.json['status'] == 'ok'

def test_update_player_requires_auth(client):
    """Test that update_player endpoint requires authentication"""
    response = client.post('/update_player', json={'player_id': '123'})
    assert response.status_code == 401
    assert response.json['error'] == 'Authentication required'

def test_update_player_missing_data(client, auth_headers):
    """Test update_player with missing data"""
    headers = {**auth_headers, 'Content-Type': 'application/json'}
    response = client.post('/update_player', headers=headers)
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid input'

def test_update_player_invalid_data_type(client, auth_headers):
    """Test update_player with invalid data type"""
    headers = {**auth_headers, 'Content-Type': 'application/json'}
    response = client.post('/update_player', 
                         data='invalid string data',
                         headers=headers)
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid input'

def test_update_player_missing_player_id(client, auth_headers):
    """Test update_player with missing player_id field"""
    response = client.post('/update_player',
                         json={'invalid': 'data'},
                         headers=auth_headers)
    assert response.status_code == 400
    assert response.json['error'] == 'Missing player_id'

def test_update_player_request_too_large(client, auth_headers):
    """Test update_player with request that exceeds size limit"""
    large_data = {'player_id': '123', 'data': 'x' * 1000}
    response = client.post('/update_player',
                         json=large_data,
                         headers=auth_headers)
    assert response.status_code == 413
    assert response.json['error'] == 'Request too large'

def test_update_player_valid_data(client, auth_headers):
    """Test update_player with valid data"""
    valid_data = {'player_id': '123', 'x': 100, 'y': 100}
    response = client.post('/update_player',
                         json=valid_data,
                         headers=auth_headers)
    assert response.status_code == 200
    assert response.json['status'] == 'ok'

def test_security_headers_present(client):
    """Test that security headers are present in responses"""
    response = client.get('/')
    
    assert 'X-Frame-Options' in response.headers
    assert 'X-Content-Type-Options' in response.headers
    assert 'Content-Security-Policy' in response.headers
