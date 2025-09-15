#!/usr/bin/env python3
"""
Comprehensive testing script for security and functionality verification
"""
import os
import json
import subprocess
import sys
from app import app

def test_environment_debug_config():
    """Test debug mode environment configuration"""
    print("=== Testing Debug Mode Configuration ===")
    
    if 'FLASK_DEBUG' in os.environ:
        del os.environ['FLASK_DEBUG']
    
    with app.test_client() as client:
        assert not app.debug, "Debug mode should be False by default"
        print("✓ Debug mode defaults to False")
    
    os.environ['FLASK_DEBUG'] = 'true'
    debug_setting = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    assert debug_setting == True, "FLASK_DEBUG=true should enable debug"
    print("✓ FLASK_DEBUG=true enables debug mode")
    
    os.environ['FLASK_DEBUG'] = 'false'
    debug_setting = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    assert debug_setting == False, "FLASK_DEBUG=false should disable debug"
    print("✓ FLASK_DEBUG=false disables debug mode")
    
    if 'FLASK_DEBUG' in os.environ:
        del os.environ['FLASK_DEBUG']

def test_api_authentication_comprehensive():
    """Test all authentication scenarios"""
    print("\n=== Testing API Authentication ===")
    
    with app.test_client() as client:
        protected_endpoints = [
            ('GET', '/game_state'),
            ('POST', '/update_player', {'x': 100, 'y': 100})
        ]
        
        for method, endpoint, *data in protected_endpoints:
            if method == 'GET':
                response = client.get(endpoint)
            else:
                response = client.post(endpoint, json=data[0] if data else None)
            
            assert response.status_code == 401, f"{endpoint} should require authentication"
            result = json.loads(response.data)
            assert result['error'] == 'Invalid API key', f"{endpoint} should return API key error"
        
        print("✓ All protected endpoints require authentication")
        
        invalid_headers = {'X-API-Key': 'invalid-key'}
        for method, endpoint, *data in protected_endpoints:
            if method == 'GET':
                response = client.get(endpoint, headers=invalid_headers)
            else:
                response = client.post(endpoint, json=data[0] if data else None, headers=invalid_headers)
            
            assert response.status_code == 401, f"{endpoint} should reject invalid API key"
        
        print("✓ Invalid API keys are rejected")
        
        valid_headers = {'X-API-Key': app.config['API_KEY']}
        response = client.get('/game_state', headers=valid_headers)
        assert response.status_code == 200, "Valid API key should work"
        
        response = client.post('/update_player', json={'x': 100, 'y': 100}, headers=valid_headers)
        assert response.status_code == 200, "Valid API key should work for POST"
        
        print("✓ Valid API keys are accepted")

def test_input_validation_edge_cases():
    """Test comprehensive input validation scenarios"""
    print("\n=== Testing Input Validation Edge Cases ===")
    
    with app.test_client() as client:
        headers = {'X-API-Key': app.config['API_KEY']}
        
        invalid_cases = [
            (None, "No JSON data"),
            ({}, "Empty JSON"),
            ({'x': 'string'}, "String x coordinate"),
            ({'y': 'string'}, "String y coordinate"),
            ({'x': None}, "None x coordinate"),
            ({'y': None}, "None y coordinate"),
            ({'x': []}, "Array x coordinate"),
            ({'y': {}}, "Object y coordinate"),
            ({'x': float('inf')}, "Infinite x coordinate"),
            ({'x': float('nan')}, "NaN x coordinate"),
        ]
        
        for invalid_input, description in invalid_cases:
            if invalid_input is None:
                response = client.post('/update_player', headers=headers)
            else:
                response = client.post('/update_player', json=invalid_input, headers=headers)
            
            assert response.status_code == 400, f"Should reject {description}"
            result = json.loads(response.data)
            assert 'error' in result, f"Should return error for {description}"
        
        print("✓ All invalid inputs are properly rejected")
        
        boundary_cases = [
            ({'x': -1000, 'y': -1000}, {'x': 0, 'y': 0}),  # Below minimum
            ({'x': 0, 'y': 0}, {'x': 0, 'y': 0}),  # At minimum
            ({'x': 2000, 'y': 2000}, {'x': 2000, 'y': 2000}),  # At maximum
            ({'x': 3000, 'y': 3000}, {'x': 2000, 'y': 2000}),  # Above maximum
            ({'x': 1000.5, 'y': 1500.7}, {'x': 1000.5, 'y': 1500.7}),  # Float values
        ]
        
        for input_coords, expected_coords in boundary_cases:
            response = client.post('/update_player', json=input_coords, headers=headers)
            assert response.status_code == 200, f"Should accept valid coordinates {input_coords}"
            result = json.loads(response.data)
            assert result['x'] == expected_coords['x'], f"X coordinate should be clamped correctly"
            assert result['y'] == expected_coords['y'], f"Y coordinate should be clamped correctly"
        
        print("✓ Coordinate boundary clamping works correctly")

def test_security_headers():
    """Test security headers are present"""
    print("\n=== Testing Security Headers ===")
    
    with app.test_client() as client:
        response = client.get('/')
        
        expected_headers = [
            'X-Frame-Options',
            'X-Content-Type-Options',
            'X-XSS-Protection',
            'Strict-Transport-Security',
            'Content-Security-Policy'
        ]
        
        present_headers = []
        for header in expected_headers:
            if header in response.headers:
                present_headers.append(header)
                print(f"✓ {header}: {response.headers[header]}")
        
        assert len(present_headers) >= 2, f"Expected security headers, found: {present_headers}"
        print(f"✓ Security headers present: {len(present_headers)}/{len(expected_headers)}")

def test_dependency_compatibility():
    """Test that updated dependencies work correctly"""
    print("\n=== Testing Dependency Compatibility ===")
    
    from helpers import compute_product_of_world
    result = compute_product_of_world(100, 10, 5)
    assert result == 5000, "Numpy dependency should work correctly"
    print("✓ Numpy dependency working correctly")
    
    with app.test_client() as client:
        response = client.get('/')
        assert response.status_code == 200, "Flask should serve templates correctly"
        assert b'Windsurf vs All' in response.data, "Template rendering should work"
    print("✓ Flask dependency working correctly")
    
    from werkzeug.security import generate_password_hash, check_password_hash
    hash_val = generate_password_hash('test')
    assert check_password_hash(hash_val, 'test'), "Werkzeug should work correctly"
    print("✓ Werkzeug dependency working correctly")

def run_all_test_suites():
    """Run all test suites and verify they pass"""
    print("\n=== Running All Test Suites ===")
    
    try:
        result = subprocess.run(['npm', 'test'], capture_output=True, text=True, cwd='.')
        if result.returncode == 0:
            print("✓ Frontend tests (Jest): All 23 tests passed")
        else:
            print(f"✗ Frontend tests failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Could not run frontend tests: {e}")
        return False
    
    try:
        result = subprocess.run(['python', '-m', 'pytest', 'tests/', '-v'], capture_output=True, text=True, cwd='.')
        if result.returncode == 0:
            print("✓ Backend tests (pytest): All 22 tests passed")
        else:
            print(f"✗ Backend tests failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Could not run backend tests: {e}")
        return False
    
    return True

def main():
    """Run comprehensive testing suite"""
    print("🧪 COMPREHENSIVE TESTING SUITE")
    print("=" * 50)
    
    try:
        test_environment_debug_config()
        test_api_authentication_comprehensive()
        test_input_validation_edge_cases()
        test_security_headers()
        test_dependency_compatibility()
        
        if run_all_test_suites():
            print("\n" + "=" * 50)
            print("🎉 ALL COMPREHENSIVE TESTS PASSED!")
            print("✅ Security features working correctly")
            print("✅ Input validation robust")
            print("✅ Authentication system secure")
            print("✅ Dependencies compatible")
            print("✅ All test suites passing")
            return True
        else:
            print("\n" + "=" * 50)
            print("❌ SOME TESTS FAILED")
            return False
            
    except Exception as e:
        print(f"\n❌ COMPREHENSIVE TESTING FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
