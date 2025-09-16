import pytest
from helpers import compute_product_of_world

def test_compute_product_of_world_basic():
    """Test basic functionality of compute_product_of_world"""
    result = compute_product_of_world(100, 10, 50)
    assert result == 50000

def test_compute_product_of_world_with_zeros():
    """Test compute_product_of_world with zero values"""
    result = compute_product_of_world(0, 10, 50)
    assert result == 0
    
    result = compute_product_of_world(100, 0, 50)
    assert result == 0
    
    result = compute_product_of_world(100, 10, 0)
    assert result == 0

def test_compute_product_of_world_with_ones():
    """Test compute_product_of_world with unit values"""
    result = compute_product_of_world(1, 1, 1)
    assert result == 1

def test_compute_product_of_world_large_numbers():
    """Test compute_product_of_world with large numbers"""
    result = compute_product_of_world(2000, 10, 100)
    assert result == 2000000

def test_compute_product_of_world_default_values():
    """Test compute_product_of_world with default game values"""
    result = compute_product_of_world(2000, 10, 100)
    assert result == 2000000
