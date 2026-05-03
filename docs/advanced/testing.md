# Testing

PyWebApp includes a comprehensive test suite. Here's how to write and run tests.

## Running Tests

```bash
# All tests
python -m pytest tests/ -v

# Specific file
python -m pytest tests/test_handlers.py -v

# With coverage
python -m pytest tests/ -v --cov=backend
```

## Test Structure

| File | Tests | What |
|------|-------|------|
| `test_handlers.py` | 28 | Unit tests for all handler functions |
| `test_api.py` | 15 | Dispatcher routing, error handling, JSON serialization |
| `test_bridge.py` | 17 | Desktop bridge round-trip, thread safety, concurrent calls |

## Writing Handler Tests

```python
# tests/test_my_handlers.py
from backend.handlers import my_function

def test_basic():
    result = my_function(5)
    assert result == expected_value

def test_error_case():
    import pytest
    with pytest.raises(ValueError, match="error message"):
        my_function(-1)
```

## Writing Dispatcher Tests

```python
from backend.api import dispatch, dispatch_json
import json

def test_dispatch():
    result = dispatch("my_method", [5])
    assert result["success"] is True

def test_dispatch_json():
    result_json = dispatch_json("my_method", "[5]")
    result = json.loads(result_json)
    assert result["success"] is True
```

## Writing Bridge Tests

```python
from desktop.bridge import BridgeApi
import json

def test_bridge_roundtrip():
    bridge = BridgeApi()
    params = json.dumps([5, 7])
    result_json = bridge.call("add", params)
    result = json.loads(result_json)
    assert result["result"] == 12
```

## Thread Safety Tests

```python
import concurrent.futures

def test_concurrent(bridge):
    def make_call(n):
        result = json.loads(bridge.call("add", f"[{n},{n}]"))
        return result["result"]

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(make_call, i) for i in range(20)]
        results = [f.result() for f in futures]

    assert sorted(results) == sorted([2*i for i in range(20)])
```
