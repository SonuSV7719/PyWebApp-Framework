# Dispatcher API

The dispatcher is the central routing layer that connects IPC calls to registered Python functions.

## Functions

### `dispatch(method, params)`

Route an IPC call to the appropriate handler.

```python
from backend.api import dispatch

result = dispatch("add", [5, 7])
# → {"success": True, "result": 12, "method": "add"}

result = dispatch("unknown")
# → {"success": False, "error": "Unknown method: 'unknown'...", "method": "unknown"}
```

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `method` | `str` | Name of the registered method |
| `params` | `list` | Positional arguments (default: `[]`) |

**Returns:** `dict` with keys `success`, `result`/`error`, `method`

### `dispatch_json(method, params_json)`

JSON-based dispatch for platforms using string-based IPC (Android `@JavascriptInterface`).

```python
from backend.api import dispatch_json

result_json = dispatch_json("add", "[5, 7]")
# → '{"success": true, "result": 12, "method": "add"}'
```

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `method` | `str` | Name of the registered method |
| `params_json` | `str` | JSON string of parameters array |

**Returns:** JSON `str`

### `list_methods()`

Returns all registered methods with descriptions.

```python
from backend.api import list_methods
methods = list_methods()
# → {"add": "Add two numbers", "subtract": "Subtract two numbers", ...}
```

### `get_schema()`

Returns full schema of all methods including parameter types.

```python
from backend.api import get_schema
schema = get_schema()
```

## Error Handling

The dispatcher catches all exceptions and returns structured errors:

| Exception Type | Error Field |
|---|---|
| `TypeError` | `"Invalid arguments for 'method': ..."` |
| `ValueError` | `"Value error in 'method': ..."` |
| `KeyError` | `"Method not found: ..."` |
| Any other | `"Unexpected error in 'method': ..."` |

All errors are logged via the `logger` module.
