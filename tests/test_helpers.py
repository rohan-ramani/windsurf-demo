import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from helpers import compute_product_of_world

def test_compute_product_of_world_basic():
    """Test basic functionality of compute_product_of_world."""
    result = compute_product_of_world(100, 5, 10)
    expected = 100 * 5 * 10
    assert result == expected

def test_compute_product_of_world_zero_values():
    """Test compute_product_of_world with zero values."""
    result = compute_product_of_world(0, 5, 10)
    assert result == 0
    
    result = compute_product_of_world(100, 0, 10)
    assert result == 0
    
    result = compute_product_of_world(100, 5, 0)
    assert result == 0

def test_compute_product_of_world_large_values():
    """Test compute_product_of_world with large values."""
    result = compute_product_of_world(2000, 10, 100)
    expected = 2000 * 10 * 100
    assert result == expected

def test_compute_product_of_world_default_game_values():
    """Test compute_product_of_world with default game configuration values."""
    WORLD_SIZE = 2000
    NUM_AI_PLAYERS = 10
    NUM_FOOD = 100
    
    result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD)
    expected = 2000 * 10 * 100
    assert result == expected
    assert result == 2000000

def test_compute_product_of_world_return_type():
    """Test that compute_product_of_world returns the correct type."""
    result = compute_product_of_world(100, 5, 10)
    assert isinstance(result, (int, float)) or hasattr(result, 'item')
