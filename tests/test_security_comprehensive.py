import pytest
import json
import string
import random

def test_sql_injection_attempts(client, auth_headers):
    """Test that SQL injection attempts are properly handled."""
    sql_payloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users --",
        "1; DELETE FROM users; --",
    ]
    
    for payload in sql_payloads:
        response = client.post('/update_player', 
                              json={'x': payload, 'y': 100}, 
                              headers=auth_headers)
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

def test_xss_injection_attempts(client, auth_headers):
    """Test that XSS injection attempts are properly handled."""
    xss_payloads = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>",
        "';alert('xss');//",
        "<svg onload=alert('xss')>",
    ]
    
    for payload in xss_payloads:
        response = client.post('/update_player', 
                              json={'x': payload, 'y': 100}, 
                              headers=auth_headers)
        assert response.status_code == 400

def test_buffer_overflow_attempts(client, auth_headers):
    """Test handling of extremely large payloads."""
    large_string = 'A' * 10000
    huge_string = 'B' * 100000
    
    payloads = [
        {'x': large_string, 'y': 100},
        {'x': 100, 'y': huge_string},
        {'x': large_string, 'y': large_string},
    ]
    
    for payload in payloads:
        response = client.post('/update_player', json=payload, headers=auth_headers)
        assert response.status_code in [400, 413]  # Bad request or payload too large

def test_api_key_brute_force_protection(client):
    """Test that API key brute force attempts are handled."""
    fake_keys = [''.join(random.choices(string.ascii_letters + string.digits, k=20)) 
                 for _ in range(100)]
    
    failed_attempts = 0
    for fake_key in fake_keys:
        response = client.get('/game_state', headers={'X-API-Key': fake_key})
        if response.status_code == 401:
            failed_attempts += 1
    
    assert failed_attempts == len(fake_keys)

def test_malformed_json_handling(client, auth_headers):
    """Test handling of malformed JSON payloads."""
    malformed_payloads = [
        '{"x": 100, "y":}',  # Missing value
        '{"x": 100, "y": 100,}',  # Trailing comma
        '{"x": 100 "y": 100}',  # Missing comma
        '{x: 100, y: 100}',  # Unquoted keys
        '{"x": 100, "y": 100',  # Missing closing brace
    ]
    
    for payload in malformed_payloads:
        response = client.post('/update_player', 
                              data=payload, 
                              content_type='application/json',
                              headers=auth_headers)
        assert response.status_code == 400

def test_http_method_tampering(client, auth_headers):
    """Test that endpoints only accept intended HTTP methods."""
    wrong_methods = [
        ('PUT', '/game_state'),
        ('DELETE', '/game_state'),
        ('PATCH', '/game_state'),
        ('GET', '/update_player'),
        ('PUT', '/update_player'),
        ('DELETE', '/update_player'),
    ]
    
    for method, endpoint in wrong_methods:
        response = client.open(method=method, path=endpoint, headers=auth_headers)
        assert response.status_code == 405

def test_content_type_validation(client, auth_headers):
    """Test that endpoints validate content types properly."""
    wrong_content_types = [
        'text/plain',
        'application/xml',
        'multipart/form-data',
        'application/x-www-form-urlencoded',
    ]
    
    for content_type in wrong_content_types:
        response = client.post('/update_player',
                              data='{"x": 100, "y": 100}',
                              content_type=content_type,
                              headers=auth_headers)
        assert response.status_code in [400, 415]  # Bad request or unsupported media type

def test_header_injection_attempts(client):
    """Test that header injection attempts are handled."""
    malicious_headers = [
        ('X-API-Key', 'valid-key\r\nX-Injected-Header: malicious'),
        ('User-Agent', 'Mozilla/5.0\r\nX-Injected: attack'),
        ('X-Forwarded-For', '127.0.0.1\r\nHost: evil.com'),
    ]
    
    for header_name, header_value in malicious_headers:
        try:
            headers = {header_name: header_value}
            response = client.get('/game_state', headers=headers)
            assert response.status_code in [400, 401]
        except ValueError as e:
            assert "newline characters" in str(e)
            continue

def test_unicode_and_encoding_attacks(client, auth_headers):
    """Test handling of various Unicode and encoding attacks."""
    unicode_payloads = [
        {'x': '\\u0000', 'y': 100},  # Null byte
        {'x': '\\u202e', 'y': 100},  # Right-to-left override
        {'x': '\\ufeff', 'y': 100},  # Byte order mark
        {'x': '\\u2028', 'y': 100},  # Line separator
        {'x': '\\u2029', 'y': 100},  # Paragraph separator
    ]
    
    for payload in unicode_payloads:
        response = client.post('/update_player', json=payload, headers=auth_headers)
        assert response.status_code == 400
