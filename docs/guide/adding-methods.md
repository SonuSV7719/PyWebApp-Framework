# Adding Methods

The framework is designed so that adding a new Python function callable from JavaScript requires **exactly one step**: add `@register()` above your function.

## Quick Example

```python
# In backend/handlers.py (or any file that imports @register)

from .registry import register

@register(description="Calculate the area of a circle")
def circle_area(radius: float) -> float:
    import math
    return math.pi * radius ** 2
```

That's it. Call it from JavaScript:

```javascript
const result = await call('circle_area', [5.0]);
// result = { success: true, result: 78.539..., method: 'circle_area' }
```

## How It Works

1. `@register()` adds the function to the global `MethodRegistry` singleton
2. The `api.py` dispatcher imports your handlers module (triggering all decorators)
3. When JS calls `call('circle_area', [5.0])`, the dispatcher looks up `circle_area` in the registry and calls it

No changes needed in:
- ❌ `api.py` (dispatcher)
- ❌ `bridge.py` (desktop bridge)
- ❌ `PythonBridge.kt` (Android bridge)
- ❌ `bridge.js` (JavaScript bridge)

## @register Options

```python
# Basic — function name becomes the method name
@register(description="Add two numbers")
def add(a, b):
    return a + b

# Custom name
@register("sum_numbers", description="Add two numbers")
def add(a, b):
    return a + b

# Namespaced
@register(description="Add two numbers", namespace="math")
def add(a, b):
    return a + b
# Registered as "math.add"
```

## Organizing Handlers

For larger apps, split handlers across multiple files:

```
backend/
├── handlers/
│   ├── __init__.py      # Import all sub-modules
│   ├── math.py          # @register(namespace="math")
│   ├── data.py          # @register(namespace="data")
│   └── system.py        # @register(namespace="system")
├── api.py
└── registry.py
```

In `handlers/__init__.py`:
```python
from . import math, data, system  # Triggers all @register decorators
```

## Type Hints & Validation

The registry captures type hints for introspection:

```python
@register(description="Divide two numbers")
def divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

Get the schema:
```python
from backend.registry import method_registry
schema = method_registry.get_schema()
# {'divide': {'description': 'Divide two numbers', 'params': [{'name': 'a', 'type': 'float'}, ...]}}
```

## Error Handling

Errors are automatically caught and returned as structured responses:

```python
@register(description="Risky operation")
def risky(x):
    if x < 0:
        raise ValueError("x must be non-negative")
    return x ** 0.5
```

```javascript
const result = await call('risky', [-1]);
// result = { success: false, error: "Value error in 'risky': x must be non-negative", method: 'risky' }
```

## Testing Your Methods

```python
# tests/test_my_handlers.py
from backend.handlers import circle_area

def test_circle_area():
    result = circle_area(5.0)
    assert abs(result - 78.5398) < 0.001

def test_circle_area_zero():
    assert circle_area(0) == 0.0
```

Run: `python -m pytest tests/ -v`
