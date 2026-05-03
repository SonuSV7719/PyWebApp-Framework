# 📚 Core API Reference

The PyWebApp Native framework relies on a simple, unified bridge between JavaScript and Python.

## 🌐 The JavaScript Bridge (`bridge.js`)

To communicate with the Python backend, import the `call` function from your frontend bridge:

```javascript
import { call } from './bridge';

// Example: Calling a Python method with parameters
const response = await call("my_python_function", { key: "value" });

if (response.success) {
    console.log("Result:", response.result);
} else {
    console.error("Error:", response.error);
}
```

### Pre-Built Native Intents
For convenience, the bridge includes pre-built wrappers for Android intents:
- `openCamera()`: Launches the system camera and returns the image URI.
- `pickFile()`: Launches the system file picker.
- `requestPermission(permissionString)`: Prompts the user for a native Android permission.

---

## 🐍 The Python API (`handlers.py`)

The Python backend listens for these calls. You register functions using the `@register` decorator.

```python
from backend.registry import register

@register("my_python_function")
def handle_my_function(params):
    # 'params' is a dictionary containing the data sent from JS
    value = params.get("key")
    
    # Whatever you return here becomes 'response.result' in JS
    return f"Received: {value}"
```

### 🛑 Error Handling
If your Python function crashes or throws an Exception, the framework automatically catches it and sends it back to JavaScript as `response.error`. You do not need to wrap everything in `try/except` unless you want custom logic.

---
[🏠 Back to Home](../)
