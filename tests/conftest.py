import pytest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['API_KEY'] = 'test-api-key'
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_headers():
    return {'X-API-Key': 'test-api-key'}

@pytest.fixture
def invalid_auth_headers():
    return {'X-API-Key': 'invalid-key'}
