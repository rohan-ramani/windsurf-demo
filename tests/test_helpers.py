import pytest
from helpers import compute_product_of_world

def test_compute_product_of_world():
    """Test the compute_product_of_world function."""
    result = compute_product_of_world(2000, 10, 100)
    expected = 2000 * 10 * 100  # 2,000,000 (important-comment)
    assert result == expected

def test_compute_product_of_world_with_zeros():
    """Test compute_product_of_world with zero values."""
    assert compute_product_of_world(0, 10, 100) == 0
    assert compute_product_of_world(2000, 0, 100) == 0
    assert compute_product_of_world(2000, 10, 0) == 0

def test_compute_product_of_world_with_ones():
    """Test compute_product_of_world with unit values."""
    assert compute_product_of_world(1, 1, 1) == 1
    assert compute_product_of_world(5, 1, 1) == 5

def test_compute_product_of_world_large_numbers():
    """Test compute_product_of_world with large numbers."""
    result = compute_product_of_world(5000, 50, 200)
    expected = 5000 * 50 * 200  # 50,000,000 (important-comment)
    assert result == expected
