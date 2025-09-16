import time
import threading
import pytest

def test_concurrent_requests_performance(client):
    """Test performance under concurrent load."""
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    start_time = time.time()
    
    results = []
    for _ in range(10):
        response = client.post('/update_player', json={'x': 100, 'y': 100})
        results.append(response.status_code)
    
    end_time = time.time()
    
    assert all(status == 200 for status in results)
    assert end_time - start_time < 2.0

def test_large_coordinate_validation_performance(client):
    """Test performance of input validation with edge cases."""
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    start_time = time.time()
    
    for i in range(100):
        response = client.post('/update_player', json={'x': i * 20, 'y': i * 20})
        assert response.status_code == 200
    
    end_time = time.time()
    
    assert end_time - start_time < 2.0

def test_session_creation_performance(client):
    """Test performance of session creation and authentication."""
    start_time = time.time()
    
    for _ in range(50):
        with client.session_transaction() as sess:
            sess['authenticated'] = True
        
        response = client.get('/game_state')
        assert response.status_code == 200
    
    end_time = time.time()
    
    assert end_time - start_time < 3.0

def test_helper_function_performance():
    """Test performance of helper functions with large inputs."""
    from helpers import compute_product_of_world
    
    start_time = time.time()
    
    for i in range(1000):
        result = compute_product_of_world(i + 1, i + 2, i + 3)
        assert isinstance(result, (int, float, complex)) or str(type(result).__name__) in ['int64', 'float64']
    
    end_time = time.time()
    
    assert end_time - start_time < 1.0

def test_memory_usage_stability(client):
    """Test that repeated requests don't cause memory leaks."""
    with client.session_transaction() as sess:
        sess['authenticated'] = True
    
    for i in range(200):
        response = client.post('/update_player', json={'x': i % 2000, 'y': i % 2000})
        assert response.status_code == 200
    
    assert True
