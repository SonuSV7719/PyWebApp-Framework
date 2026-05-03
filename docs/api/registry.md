# @register Decorator

The `@register` decorator is the core abstraction of PyWebApp. It exposes any Python function as an IPC-callable method with zero boilerplate.

## Import

```python
from backend.registry import register
# or
from backend.registry import method_registry
```

## Basic Usage

```python
@register(description="Add two numbers")
def add(a: float, b: float) -> float:
    return a + b
```

This registers the function as `"add"` — callable from JavaScript via `call('add', [5, 7])`.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | `str` | Function name | Override the method name |
| `description` | `str` | `""` | Human-readable description |
| `namespace` | `str` | `""` | Prefix group (e.g., `"math"` → `"math.add"`) |

## Examples

```python
# Default name (uses function name)
@register(description="Multiply two numbers")
def multiply(a, b):
    return a * b
# Registered as: "multiply"

# Custom name
@register("calc_sum", description="Sum numbers")
def add(a, b):
    return a + b
# Registered as: "calc_sum"

# Namespaced
@register(description="Get user profile", namespace="user")
def get_profile(user_id: int) -> dict:
    return {"id": user_id, "name": "Alice"}
# Registered as: "user.get_profile"
```

## MethodRegistry Class

The `MethodRegistry` is the singleton that stores all registered methods.

### `method_registry.call(method, params)`

Call a registered method directly.

```python
result = method_registry.call("add", [5, 7])
# → 12
```

### `method_registry.list_methods()`

List all registered methods with descriptions.

```python
methods = method_registry.list_methods()
# → {"add": "Add two numbers", "multiply": "Multiply two numbers", ...}
```

### `method_registry.get_schema()`

Get full schema including parameter info.

```python
schema = method_registry.get_schema()
# → {"add": {"description": "...", "params": [{"name": "a", "type": "float"}, ...], "module": "..."}}
```

### `method_registry.has_method(name)`

Check if a method is registered.

```python
method_registry.has_method("add")  # → True
method_registry.has_method("foo")  # → False
```

### `method_registry.add_pre_middleware(func)`

Add a function called **before** every method execution.

```python
def log_call(method, params):
    print(f"Calling {method} with {params}")

method_registry.add_pre_middleware(log_call)
```

### `method_registry.add_post_middleware(func)`

Add a function called **after** every method execution.

```python
def log_result(method, params, result):
    print(f"{method} returned {result}")

method_registry.add_post_middleware(log_result)
```

### `method_registry.unregister(name)`

Remove a method from the registry.

```python
method_registry.unregister("old_method")
```
