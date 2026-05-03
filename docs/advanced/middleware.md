# Middleware

Middleware functions run before and/or after every IPC call. Use them for logging, auth, caching, timing, and other cross-cutting concerns.

## Adding Middleware

```python
from backend.registry import method_registry

# Pre-call: runs BEFORE the handler
method_registry.add_pre_middleware(my_pre_function)

# Post-call: runs AFTER the handler
method_registry.add_post_middleware(my_post_function)
```

## Pre-Middleware

Signature: `func(method: str, params: list)`

```python
def log_call(method, params):
    print(f"→ {method}({params})")

def rate_limit(method, params):
    import time
    key = f"{method}:{time.time() // 1}"
    # Check rate limit...

def auth_check(method, params):
    if method.startswith("admin."):
        # Validate auth token
        token = params[-1] if params else None
        if not validate_token(token):
            raise PermissionError(f"Unauthorized: {method}")

method_registry.add_pre_middleware(log_call)
method_registry.add_pre_middleware(auth_check)
```

## Post-Middleware

Signature: `func(method: str, params: list, result: any)`

```python
import time

# Timing
_call_start = {}

def start_timer(method, params):
    _call_start[method] = time.time()

def log_timing(method, params, result):
    elapsed = time.time() - _call_start.pop(method, time.time())
    print(f"← {method} completed in {elapsed:.3f}s")

# Caching
_cache = {}

def cache_result(method, params, result):
    cache_key = f"{method}:{str(params)}"
    _cache[cache_key] = result

method_registry.add_pre_middleware(start_timer)
method_registry.add_post_middleware(log_timing)
method_registry.add_post_middleware(cache_result)
```

## Middleware Order

Middleware runs in the order it's added:

```
Pre-MW 1 → Pre-MW 2 → Handler → Post-MW 1 → Post-MW 2
```

## Error Handling in Middleware

If a pre-middleware raises an exception, the handler is **not called** and the error is returned to the caller via the dispatcher's error handling.
