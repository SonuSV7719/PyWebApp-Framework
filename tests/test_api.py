"""
Unit tests for the API dispatcher.
Tests method routing, error handling, JSON serialization, and introspection.
"""

import json
import os
import sys
import pytest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from backend.api import dispatch, dispatch_json, list_methods


class TestDispatch:
    """Tests for the dispatch() function."""

    def test_known_method(self):
        result = dispatch("add", [3, 4])
        assert result["success"] is True
        assert result["result"] == 7
        assert result["method"] == "add"

    def test_unknown_method(self):
        result = dispatch("nonexistent_method", [])
        assert result["success"] is False
        assert "Unknown method" in result["error"]
        assert result["method"] == "nonexistent_method"

    def test_wrong_args(self):
        # add() expects exactly 2 args, give it 3
        result = dispatch("add", [1, 2, 3])
        assert result["success"] is False
        assert "Invalid arguments" in result["error"]

    def test_no_params(self):
        result = dispatch("get_system_info")
        assert result["success"] is True
        assert "platform" in result["result"]

    def test_none_params(self):
        result = dispatch("get_system_info", None)
        assert result["success"] is True

    def test_value_error_propagation(self):
        result = dispatch("fibonacci", [-1])
        assert result["success"] is False
        assert "Value error" in result["error"]

    def test_all_registered_methods(self):
        """Every registered method should be callable without crashing."""
        methods = list_methods()
        assert len(methods) > 0
        for method_name in methods:
            # Just verify dispatch doesn't crash with empty args
            # (some will fail due to missing args, which is fine)
            result = dispatch(method_name, [])
            assert "method" in result
            assert "success" in result


class TestDispatchJson:
    """Tests for the JSON-based dispatch."""

    def test_basic_json(self):
        result_json = dispatch_json("add", "[5, 7]")
        result = json.loads(result_json)
        assert result["success"] is True
        assert result["result"] == 12

    def test_empty_params(self):
        result_json = dispatch_json("get_system_info", "[]")
        result = json.loads(result_json)
        assert result["success"] is True

    def test_invalid_json(self):
        result_json = dispatch_json("add", "not-json")
        result = json.loads(result_json)
        assert result["success"] is False
        assert "Invalid JSON" in result["error"]

    def test_null_params(self):
        result_json = dispatch_json("get_system_info", "")
        result = json.loads(result_json)
        assert result["success"] is True

    def test_result_is_valid_json(self):
        """Ensure all dispatch_json results are valid JSON strings."""
        test_cases = [
            ("add", "[1, 2]"),
            ("subtract", "[10, 3]"),
            ("process_data", '["hello"]'),
            ("get_system_info", "[]"),
            ("fibonacci", "[5]"),
            ("nonexistent", "[]"),
            ("add", "invalid"),
        ]
        for method, params in test_cases:
            result_json = dispatch_json(method, params)
            # Must be valid JSON
            result = json.loads(result_json)
            assert isinstance(result, dict)
            assert "success" in result
            assert "method" in result


class TestListMethods:
    """Tests for method introspection."""

    def test_returns_dict(self):
        methods = list_methods()
        assert isinstance(methods, dict)

    def test_contains_core_methods(self):
        methods = list_methods()
        expected = ["add", "subtract", "multiply", "process_data", "get_system_info", "fibonacci"]
        for m in expected:
            assert m in methods, f"Missing method: {m}"

    def test_descriptions_are_strings(self):
        methods = list_methods()
        for name, desc in methods.items():
            assert isinstance(desc, str), f"Description for {name} is not a string"
            assert len(desc) > 0, f"Description for {name} is empty"
