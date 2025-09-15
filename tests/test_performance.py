import pytest
import time
import threading
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

def test_concurrent_api_requests(client, auth_headers):
    """Test API endpoints under rapid sequential load."""
    import time
    
    start_time = time.time()
    successes = 0
    
    for _ in range(50):
        try:
            response = client.get('/game_state', headers=auth_headers)
            if response.status_code == 200:
                successes += 1
        except Exception:
            pass
    
    elapsed_time = time.time() - start_time
    requests_per_second = 50 / elapsed_time
    success_rate = successes / 50
    
    assert success_rate >= 0.95, f"Success rate {success_rate} below 95%"
    assert requests_per_second >= 100, f"Too slow: {requests_per_second} req/s"

def test_rapid_player_updates(client, auth_headers):
    """Test rapid succession of player position updates."""
    positions = [
        {'x': i * 10, 'y': i * 10} 
        for i in range(100)
    ]
    
    start_time = time.time()
    for pos in positions:
        response = client.post('/update_player', json=pos, headers=auth_headers)
        assert response.status_code == 200
    
    elapsed_time = time.time() - start_time
    requests_per_second = len(positions) / elapsed_time
    
    assert requests_per_second >= 50, f"Performance too slow: {requests_per_second} req/s"

def test_memory_usage_stability(client, auth_headers):
    """Test that repeated requests don't cause memory leaks."""
    import psutil
    import os
    
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss
    
    for i in range(1000):
        response = client.post('/update_player', 
                              json={'x': i % 2000, 'y': i % 2000}, 
                              headers=auth_headers)
        assert response.status_code == 200
    
    final_memory = process.memory_info().rss
    memory_increase = (final_memory - initial_memory) / initial_memory
    
    assert memory_increase < 0.5, f"Memory increased by {memory_increase:.2%}"

def test_large_coordinate_values(client, auth_headers):
    """Test handling of very large coordinate values."""
    large_values = [
        {'x': 999999999, 'y': 999999999},
        {'x': -999999999, 'y': -999999999},
        {'x': float('inf'), 'y': 100},  # Should be handled gracefully
        {'x': 100, 'y': float('-inf')},
    ]
    
    for coords in large_values:
        try:
            response = client.post('/update_player', json=coords, headers=auth_headers)
            assert response.status_code in [200, 400]
            
            if response.status_code == 200:
                data = json.loads(response.data)
                assert 0 <= data['x'] <= 2000
                assert 0 <= data['y'] <= 2000
        except (ValueError, OverflowError):
            pass

def test_api_response_time(client, auth_headers):
    """Test that API responses are within acceptable time limits."""
    endpoints = [
        ('GET', '/game_state', None),
        ('POST', '/update_player', {'x': 100, 'y': 100}),
    ]
    
    for method, endpoint, data in endpoints:
        times = []
        for _ in range(10):
            start_time = time.time()
            
            if method == 'GET':
                response = client.get(endpoint, headers=auth_headers)
            else:
                response = client.post(endpoint, json=data, headers=auth_headers)
            
            elapsed_time = time.time() - start_time
            times.append(elapsed_time)
            
            assert response.status_code == 200
        
        avg_time = sum(times) / len(times)
        max_time = max(times)
        
        assert avg_time < 0.1, f"{endpoint} avg response time {avg_time:.3f}s too slow"
        assert max_time < 0.5, f"{endpoint} max response time {max_time:.3f}s too slow"
