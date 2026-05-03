# Namespaces

Group related methods under a namespace prefix for better organization in larger applications.

## Usage

```python
from backend.registry import register

@register(description="Add two numbers", namespace="math")
def add(a, b):
    return a + b

@register(description="Login", namespace="auth")
def login(username, password):
    return {"token": "..."}
```

Call from JavaScript:
```javascript
await call('math.add', [5, 7]);
await call('auth.login', ['admin', 'pass']);
```

## Organizing by File

```
backend/handlers/
├── __init__.py
├── math.py       # All methods namespaced under "math"
├── auth.py       # All methods namespaced under "auth"
└── data.py       # All methods namespaced under "data"
```

```python
# backend/handlers/math.py
from ..registry import register

@register(namespace="math", description="Add")
def add(a, b): return a + b

@register(namespace="math", description="Subtract")
def subtract(a, b): return a - b
```

## Listing Namespaced Methods

```python
methods = method_registry.list_methods()
# {
#   "math.add": "Add",
#   "math.subtract": "Subtract",
#   "auth.login": "Login",
#   "data.process": "Process data"
# }
```
