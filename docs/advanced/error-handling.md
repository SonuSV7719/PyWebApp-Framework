# Error Handling

PyWebApp provides structured error handling at every layer.

## Python Side

All exceptions in handlers are caught by the dispatcher and returned as structured errors:

```python
@register(description="Divide two numbers")
def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

```javascript
const result = await call('divide', [10, 0]);
// {
//   success: false,
//   error: "Value error in 'divide': Cannot divide by zero",
//   method: "divide"
// }
```

## Error Categories

| Python Exception | Error Prefix | When |
|---|---|---|
| `TypeError` | `"Invalid arguments"` | Wrong number/type of params |
| `ValueError` | `"Value error"` | Invalid input values |
| `KeyError` | `"Method not found"` | Unregistered method name |
| Any other | `"Unexpected error"` | Catch-all |

## JavaScript Side

```javascript
try {
  const result = await call('my_method', [params]);
  
  if (result.success) {
    // Handle success
    console.log(result.result);
  } else {
    // Handle Python-level error
    console.error(result.error);
    showErrorToast(result.error);
  }
} catch (err) {
  // Handle bridge-level error (IPC failure, timeout)
  console.error('Bridge error:', err.message);
}
```

## Best Practices

1. **Use specific exceptions** — `ValueError`, `TypeError`, not generic `Exception`
2. **Return structured errors** from handlers when possible
3. **Log everything** — the framework logs all calls and errors automatically
4. **Set timeouts** — Android bridge has a 30s timeout; adjust if needed
