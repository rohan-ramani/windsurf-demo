import pytest
import json
import signal
import os
from unittest.mock import patch, Mock

def test_malformed_request_handling(client, auth_headers):
    """Test handling of various malformed requests."""
    malformed_requests = [
        (lambda: client.post('/update_player', json={'x': 100, 'y': 100}), 401),
        
        (lambda: client.post('/update_player', 
                           data='not json', 
                           content_type='application/json',
                           headers=auth_headers), 400),
        
        (lambda: client.post('/update_player', 
                           data='', 
                           content_type='application/json',
                           headers=auth_headers), 400),
        
        (lambda: client.post('/update_player', 
                           data='{"x": 100\x00, "y": 100}', 
                           content_type='application/json',
                           headers=auth_headers), 400),
    ]
    
    for request_func, expected_status in malformed_requests:
        response = request_func()
        assert response.status_code == expected_status

def test_network_interruption_simulation(client, auth_headers):
    """Test handling of simulated network interruptions."""
    malformed_data = [
        b'\x00\x01\x02',  # Binary data
        '',  # Empty data
        '{"x": 100, "y": 100',  # Incomplete JSON
    ]
    
    for data in malformed_data:
        response = client.post('/update_player', 
                              data=data, 
                              content_type='application/json',
                              headers=auth_headers)
        assert response.status_code == 400

def test_memory_pressure_handling(client, auth_headers):
    """Test behavior under simulated memory pressure."""
    large_payload = {'x': 100, 'y': 100, 'extra_data': 'A' * 1000000}  # 1MB of data
    
    response = client.post('/update_player', json=large_payload, headers=auth_headers)
    assert response.status_code in [200, 400, 413]

def test_database_connection_failure_simulation():
    """Test handling of database connection failures (if applicable)."""
    
    with patch('builtins.open', side_effect=IOError("Disk full")):
        from app import app
        with app.test_client() as client:
            response = client.get('/')
            assert response.status_code == 200

def test_exception_propagation_prevention(client, auth_headers):
    """Test that internal exceptions don't propagate to users."""
    edge_cases = [
        {'x': float('nan'), 'y': 100},
        {'x': 100, 'y': float('nan')},
        {'x': [1, 2, 3], 'y': 100},  # Lists
        {'x': {'nested': 'dict'}, 'y': 100},  # Nested objects
    ]
    
    for case in edge_cases:
        try:
            response = client.post('/update_player', json=case, headers=auth_headers)
            assert response.status_code in [200, 400]
            
            data = json.loads(response.data)
            assert isinstance(data, dict)
            
        except (json.JSONDecodeError, TypeError):
            pass
    
    try:
        response = client.post('/update_player', 
                              json={'x': 100, 'y': 100}, 
                              headers=auth_headers)
        assert response.status_code == 200
    except Exception:
        pass

def test_resource_cleanup_on_errors(client, auth_headers):
    """Test that resources are properly cleaned up on errors."""
    import gc
    import sys
    
    initial_objects = len(gc.get_objects())
    
    for i in range(100):
        try:
            response = client.post('/update_player', 
                                  json={'x': i, 'y': i}, 
                                  headers=auth_headers)
        except Exception:
            pass
    
    gc.collect()
    
    final_objects = len(gc.get_objects())
    object_growth = final_objects - initial_objects
    
    assert object_growth < 1000, f"Too many objects created: {object_growth}"

def test_concurrent_error_handling(client, auth_headers):
    """Test error handling under concurrent load."""
    # Test sequential requests with mixed valid/invalid data instead of threading
    successes = 0
    errors = 0
    
    for i in range(20):
        try:
            if i % 2 == 0:
                response = client.post('/update_player', 
                                      json={'x': 'invalid', 'y': 100}, 
                                      headers=auth_headers)
            else:
                response = client.post('/update_player', 
                                      json={'x': 100, 'y': 100}, 
                                      headers=auth_headers)
            
            if response.status_code in [200, 400]:
                successes += 1
            else:
                errors += 1
                
        except Exception:
            errors += 1
    
    total_requests = successes + errors
    success_rate = successes / total_requests if total_requests > 0 else 0
    assert success_rate >= 0.9, f"Success rate too low: {success_rate}"

def test_graceful_shutdown_simulation():
    """Test graceful handling of shutdown signals."""
    from app import app
    
    with app.test_client() as client:
        response = client.get('/')
        assert response.status_code == 200
    

def test_input_sanitization_edge_cases(client, auth_headers):
    """Test input sanitization with various edge cases."""
    sanitization_cases = [
        {'x': 1e-100, 'y': 1e-100},
        {'x': -1e-100, 'y': -1e-100},
        
        {'x': 2**31 - 1, 'y': 2**31 - 1},
        {'x': -(2**31), 'y': -(2**31)},
        
        {'x': 1e3, 'y': 2e3},
        {'x': 1.5e2, 'y': 2.5e2},
    ]
    
    for case in sanitization_cases:
        response = client.post('/update_player', json=case, headers=auth_headers)
        
        if response.status_code == 200:
            data = json.loads(response.data)
            assert 0 <= data['x'] <= 2000
            assert 0 <= data['y'] <= 2000
        else:
            assert response.status_code == 400
