import pytest
import json
from unittest.mock import patch
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from helpers import compute_product_of_world

def test_world_size_calculations():
    """Test world size calculations with various parameters."""
    test_cases = [
        (100, 5, 10, 5000),
        (2000, 10, 50, 1000000),
        (500, 0, 20, 0),  # No AI players
        (1000, 15, 0, 0),  # No food
        (1, 1, 1, 1),  # Minimum values
    ]
    
    for world_size, ai_players, food, expected in test_cases:
        result = compute_product_of_world(world_size, ai_players, food)
        assert result == expected, f"Expected {expected}, got {result}"

def test_coordinate_boundary_edge_cases(client, auth_headers):
    """Test coordinate handling at exact boundaries."""
    boundary_cases = [
        {'x': 0, 'y': 0},
        {'x': 2000, 'y': 2000},
        {'x': 0, 'y': 2000},
        {'x': 2000, 'y': 0},
        
        {'x': -0.1, 'y': 0},
        {'x': 0, 'y': -0.1},
        {'x': 2000.1, 'y': 2000},
        {'x': 2000, 'y': 2000.1},
        
        {'x': 1999.9999999, 'y': 1999.9999999},
        {'x': 0.0000001, 'y': 0.0000001},
    ]
    
    for coords in boundary_cases:
        response = client.post('/update_player', json=coords, headers=auth_headers)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 0 <= data['x'] <= 2000, f"X coordinate {data['x']} out of bounds"
        assert 0 <= data['y'] <= 2000, f"Y coordinate {data['y']} out of bounds"

def test_game_state_consistency(client, auth_headers):
    """Test that game state remains consistent across multiple operations."""
    moves = [
        {'x': 100, 'y': 100},
        {'x': 150, 'y': 120},
        {'x': 200, 'y': 180},
        {'x': 180, 'y': 160},
        {'x': 220, 'y': 200},
    ]
    
    for i, move in enumerate(moves):
        response = client.post('/update_player', json=move, headers=auth_headers)
        assert response.status_code == 200
        
        response = client.get('/game_state', headers=auth_headers)
        assert response.status_code == 200
        
        game_data = json.loads(response.data)
        assert game_data['status'] == 'ok'

def test_concurrent_player_updates(client, auth_headers):
    """Test handling of rapid sequential player position updates."""
    results = []
    
    for i in range(20):
        try:
            response = client.post('/update_player', 
                                  json={'x': i * 10, 'y': i * 10}, 
                                  headers=auth_headers)
            results.append(response.status_code)
        except Exception as e:
            results.append(500)  # Mark as error
    
    success_count = sum(1 for status in results if status == 200)
    success_rate = success_count / len(results) if results else 0
    
    assert success_rate >= 0.95, f"Success rate too low: {success_rate}"

def test_game_configuration_validation():
    """Test that game configuration constants are valid."""
    from app import WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD
    
    assert WORLD_SIZE > 0, "World size must be positive"
    assert isinstance(WORLD_SIZE, int), "World size must be integer"
    
    assert NUM_AI_PLAYERS >= 0, "Number of AI players must be non-negative"
    assert isinstance(NUM_AI_PLAYERS, int), "Number of AI players must be integer"
    
    assert NUM_FOOD >= 0, "Number of food items must be non-negative"
    assert isinstance(NUM_FOOD, int), "Number of food items must be integer"

def test_mathematical_precision(client, auth_headers):
    """Test mathematical precision in coordinate calculations."""
    precision_cases = [
        {'x': 1.0000000001, 'y': 1.0000000001},
        {'x': 999.9999999999, 'y': 999.9999999999},
        {'x': 0.1 + 0.2, 'y': 0.3},  # Floating point precision test
        {'x': 1/3, 'y': 2/3},  # Repeating decimals
    ]
    
    for coords in precision_cases:
        response = client.post('/update_player', json=coords, headers=auth_headers)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert abs(data['x'] - min(max(coords['x'], 0), 2000)) < 1e-10
        assert abs(data['y'] - min(max(coords['y'], 0), 2000)) < 1e-10

def test_game_state_under_load(client, auth_headers):
    """Test game state endpoint under sustained load."""
    import time
    
    start_time = time.time()
    request_count = 0
    errors = 0
    
    while time.time() - start_time < 5:
        response = client.get('/game_state', headers=auth_headers)
        request_count += 1
        
        if response.status_code != 200:
            errors += 1
    
    requests_per_second = request_count / 5
    error_rate = errors / request_count if request_count > 0 else 0
    
    assert requests_per_second >= 100, f"Too slow: {requests_per_second} req/s"
    assert error_rate < 0.01, f"Too many errors: {error_rate:.2%}"

def test_numpy_integration_edge_cases():
    """Test numpy integration with edge cases."""
    import numpy as np
    
    edge_cases = [
        (0, 0, 0),  # All zeros
        (1, 1, 1),  # All ones
        (np.inf, 1, 1),  # Infinity
        (1, np.inf, 1),  # Infinity in different position
        (1e10, 1e10, 1e10),  # Very large numbers
    ]
    
    for world_size, ai_players, food in edge_cases:
        try:
            result = compute_product_of_world(world_size, ai_players, food)
            if not (np.isinf(world_size) or np.isinf(ai_players) or np.isinf(food)):
                assert np.isfinite(result), f"Result should be finite for {world_size}, {ai_players}, {food}"
        except (OverflowError, ValueError):
            pass
