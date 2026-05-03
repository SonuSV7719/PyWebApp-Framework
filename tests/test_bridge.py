"""
Integration tests for the desktop bridge.
Tests the BridgeApi class that pywebview uses to expose Python to JavaScript.
"""

import json
import os
import sys
import pytest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, os.path.join(PROJECT_ROOT, "desktop"))

from desktop.bridge import BridgeApi


@pytest.fixture
def bridge():
    """Create a BridgeApi instance for testing."""
    return BridgeApi()


class TestBridgeCall:
    """Tests for Bridge.call() — the main IPC entry point."""

    def test_add(self, bridge):
        result_json = bridge.call("add", "[5, 7]")
        result = json.loads(result_json)
        assert result["success"] is True
        assert result["result"] == 12

    def test_subtract(self, bridge):
        result_json = bridge.call("subtract", "[10, 3]")
        result = json.loads(result_json)
        assert result["success"] is True
        assert result["result"] == 7

    def test_process_data(self, bridge):
        result_json = bridge.call("process_data", '["hello world"]')
        result = json.loads(result_json)
        assert result["success"] is True
        assert result["result"]["word_count"] == 2

    def test_system_info(self, bridge):
        result_json = bridge.call("get_system_info", "[]")
        result = json.loads(result_json)
        assert result["success"] is True
        assert "platform" in result["result"]

    def test_unknown_method(self, bridge):
        result_json = bridge.call("does_not_exist", "[]")
        result = json.loads(result_json)
        assert result["success"] is False
        assert "Unknown method" in result["error"]

    def test_invalid_json_params(self, bridge):
        result_json = bridge.call("add", "not-json")
        result = json.loads(result_json)
        assert result["success"] is False

    def test_empty_params(self, bridge):
        result_json = bridge.call("get_system_info")
        result = json.loads(result_json)
        assert result["success"] is True

    def test_fibonacci(self, bridge):
        result_json = bridge.call("fibonacci", "[8]")
        result = json.loads(result_json)
        assert result["success"] is True
        assert result["result"] == [0, 1, 1, 2, 3, 5, 8, 13]


class TestBridgeListMethods:
    """Tests for Bridge.list_methods()."""

    def test_returns_json(self, bridge):
        result_json = bridge.list_methods()
        methods = json.loads(result_json)
        assert isinstance(methods, dict)
        assert "add" in methods

    def test_all_methods_present(self, bridge):
        methods = json.loads(bridge.list_methods())
        expected = ["add", "subtract", "multiply", "process_data", "get_system_info"]
        for m in expected:
            assert m in methods


class TestBridgePing:
    """Tests for Bridge.ping() health check."""

    def test_ping(self, bridge):
        result_json = bridge.ping()
        result = json.loads(result_json)
        assert result["status"] == "ok"


class TestBridgeThreadSafety:
    """Tests for concurrent bridge calls."""

    def test_concurrent_calls(self, bridge):
        """Simulate multiple concurrent calls."""
        import concurrent.futures

        def make_call(n):
            result_json = bridge.call("add", f"[{n}, {n}]")
            return json.loads(result_json)

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(make_call, i) for i in range(20)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        assert all(r["success"] for r in results)
        # Each result should be n + n = 2n
        result_values = sorted([r["result"] for r in results])
        expected = sorted([2 * i for i in range(20)])
        assert result_values == expected


class TestRoundTrip:
    """End-to-end round-trip tests simulating the full JS→Bridge→Python→Bridge→JS flow."""

    def test_full_roundtrip(self, bridge):
        """Simulate what JavaScript does: send JSON, get JSON back, parse it."""
        # This is exactly what JS does:
        # 1. Serialize params to JSON
        params = json.dumps([42, 58])
        # 2. Call bridge
        result_json = bridge.call("add", params)
        # 3. Parse response
        result = json.loads(result_json)
        # 4. Extract value
        assert result["success"] is True
        assert result["result"] == 100

    def test_complex_data_roundtrip(self, bridge):
        """Test with complex data going through the pipeline."""
        text = "The quick brown fox jumps over the lazy dog"
        params = json.dumps([text])
        result_json = bridge.call("process_data", params)
        result = json.loads(result_json)

        assert result["success"] is True
        assert result["result"]["word_count"] == 9
        assert result["result"]["uppercase"] == text.upper()
