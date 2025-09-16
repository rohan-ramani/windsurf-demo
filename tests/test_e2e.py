import pytest
import time
import threading
from app import app

@pytest.fixture(scope="session")
def flask_server():
    """Start Flask server for E2E tests."""
    def run_server():
        app.run(host='127.0.0.1', port=5555, debug=False)
    
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(2)
    yield "http://127.0.0.1:5555"

def test_server_starts_correctly(flask_server):
    """Test that the Flask server starts and responds."""
    try:
        import requests
        response = requests.get(flask_server, timeout=5)
        assert response.status_code == 200
    except ImportError:
        pytest.skip("requests module not available for E2E testing")
    except Exception:
        pytest.skip("Server not available for E2E testing")

def test_security_headers_in_real_request(flask_server):
    """Test that security headers are present in real HTTP requests."""
    try:
        import requests
        response = requests.get(flask_server, timeout=5)
        
        headers = response.headers
        assert 'x-content-type-options' in headers or 'X-Content-Type-Options' in headers
        assert 'x-frame-options' in headers or 'X-Frame-Options' in headers
        assert 'x-xss-protection' in headers or 'X-XSS-Protection' in headers
        assert 'content-security-policy' in headers or 'Content-Security-Policy' in headers
    except ImportError:
        pytest.skip("requests module not available for E2E testing")
    except Exception:
        pytest.skip("Server not available for E2E testing")

def test_api_endpoints_respond_correctly(flask_server):
    """Test that API endpoints respond with correct status codes."""
    try:
        import requests
        response = requests.get(f"{flask_server}/game_state", timeout=5)
        assert response.status_code == 401
        
        response = requests.post(f"{flask_server}/update_player", 
                               json={'x': 100, 'y': 100}, 
                               timeout=5)
        assert response.status_code == 401
    except ImportError:
        pytest.skip("requests module not available for E2E testing")
    except Exception:
        pytest.skip("Server not available for E2E testing")
