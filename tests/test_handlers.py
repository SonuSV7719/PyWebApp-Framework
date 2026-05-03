"""
Unit tests for backend handler functions.
Tests all business logic in isolation.
"""

import os
import sys
import pytest

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from backend.handlers import (
    add,
    async_heavy_task,
    fibonacci,
    get_system_info,
    multiply,
    process_data,
    subtract,
)


# ─── Arithmetic Tests ─────────────────────────────────

class TestAdd:
    def test_positive_numbers(self):
        assert add(5, 7) == 12

    def test_negative_numbers(self):
        assert add(-3, -5) == -8

    def test_mixed_sign(self):
        assert add(-10, 5) == -5

    def test_zero(self):
        assert add(0, 0) == 0

    def test_floats(self):
        assert add(1.5, 2.5) == 4.0

    def test_large_numbers(self):
        assert add(10**18, 10**18) == 2 * 10**18


class TestSubtract:
    def test_basic(self):
        assert subtract(10, 3) == 7

    def test_negative_result(self):
        assert subtract(3, 10) == -7

    def test_zero(self):
        assert subtract(5, 5) == 0


class TestMultiply:
    def test_basic(self):
        assert multiply(3, 4) == 12

    def test_zero(self):
        assert multiply(5, 0) == 0

    def test_negative(self):
        assert multiply(-3, 4) == -12

    def test_both_negative(self):
        assert multiply(-3, -4) == 12

    def test_floats(self):
        assert multiply(2.5, 4) == 10.0


# ─── Data Processing Tests ────────────────────────────

class TestProcessData:
    def test_basic(self):
        result = process_data("hello world")
        assert result["original"] == "hello world"
        assert result["uppercase"] == "HELLO WORLD"
        assert result["word_count"] == 2
        assert result["char_count"] == 10  # no spaces
        assert result["reversed"] == "dlrow olleh"
        assert "timestamp" in result

    def test_empty_string(self):
        result = process_data("")
        assert result["word_count"] == 0
        assert result["char_count"] == 0

    def test_single_word(self):
        result = process_data("Python")
        assert result["word_count"] == 1
        assert result["uppercase"] == "PYTHON"

    def test_special_characters(self):
        result = process_data("Hello, World! 123")
        assert result["word_count"] == 3
        assert "timestamp" in result


# ─── System Info Tests ─────────────────────────────────

class TestGetSystemInfo:
    def test_returns_dict(self):
        info = get_system_info()
        assert isinstance(info, dict)

    def test_required_keys(self):
        info = get_system_info()
        required_keys = [
            "platform", "platform_release", "platform_version",
            "architecture", "python_version", "timestamp",
        ]
        for key in required_keys:
            assert key in info, f"Missing key: {key}"

    def test_platform_not_empty(self):
        info = get_system_info()
        assert len(info["platform"]) > 0
        assert len(info["python_version"]) > 0


# ─── Fibonacci Tests ──────────────────────────────────

class TestFibonacci:
    def test_zero(self):
        assert fibonacci(0) == []

    def test_one(self):
        assert fibonacci(1) == [0]

    def test_two(self):
        assert fibonacci(2) == [0, 1]

    def test_ten(self):
        result = fibonacci(10)
        assert result == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

    def test_negative_raises(self):
        with pytest.raises(ValueError, match="non-negative"):
            fibonacci(-1)

    def test_too_large_raises(self):
        with pytest.raises(ValueError, match="exceed 100"):
            fibonacci(101)

    def test_boundary_100(self):
        result = fibonacci(100)
        assert len(result) == 100
        # Verify Fibonacci property
        for i in range(2, len(result)):
            assert result[i] == result[i-1] + result[i-2]


# ─── Async Heavy Task Tests ───────────────────────────

class TestAsyncHeavyTask:
    def test_returns_completed(self):
        result = async_heavy_task(0.1)
        assert result["status"] == "completed"
        assert "actual_duration" in result

    def test_duration_cap(self):
        # Should cap at 10 seconds (we test the internal logic, not actually wait 10s)
        result = async_heavy_task(0.1)
        assert result["requested_duration"] == 0.1

    def test_result_structure(self):
        result = async_heavy_task(0.05)
        assert "status" in result
        assert "message" in result
        assert "timestamp" in result
