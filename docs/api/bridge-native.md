# Native Bridge Reference

Platform-specific bridge implementations that connect JavaScript to Python.

## Desktop — `BridgeApi` (pywebview)

**File:** `desktop/bridge.py`

The `BridgeApi` class is passed to pywebview's `create_window()` as the `js_api` parameter. All public methods become available in JavaScript via `window.pywebview.api.*`.

### Methods

#### `call(method, params_json)`
Main IPC entry point.

```python
# Called from JS as: pywebview.api.call('add', '[5, 7]')
def call(self, method: str, params_json: str = "[]") -> str:
```

Thread-safe (uses `threading.Lock`). Returns JSON string.

#### `list_methods()`
Returns JSON object of all available methods.

#### `ping()`
Health check — returns `{"status": "ok"}`.

---

## Android — `PythonBridge` (Kotlin)

**File:** `android/.../PythonBridge.kt`

Registered as `window.NativeBridge` via `addJavascriptInterface()`.

### Methods

#### `call(method, paramsJson, callbackId)`
Async IPC entry point. Runs Python on a background thread.

```kotlin
@JavascriptInterface
fun call(method: String, paramsJson: String, callbackId: String)
```

- Executes on a **thread pool** (4 threads)
- Returns result via `webView.evaluateJavascript()` on the UI thread
- Includes error handling and JSON escaping

#### `callSync(method, paramsJson)`
Synchronous variant for fast operations.

```kotlin
@JavascriptInterface
fun callSync(method: String, paramsJson: String): String
```

::: warning
`callSync` blocks the calling thread. Only use for sub-millisecond operations like `ping()`.
:::

### Thread Architecture

```
JS Thread (WebView)
  │
  ├─→ call() ──→ Thread Pool (4 threads) ──→ Python (Chaquopy)
  │                    │
  │                    └──→ Result via evaluateJavascript()
  │                              │
  └──────────────────────────────┘ (UI Thread)
```
