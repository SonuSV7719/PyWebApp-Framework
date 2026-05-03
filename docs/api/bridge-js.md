# bridge.js API

The JavaScript bridge abstracts platform-specific IPC into a single universal interface.

## Import

```javascript
import { call, getPlatform, isBridgeReady } from './bridge';
```

## `call(method, params)`

Call a Python backend method via IPC.

```javascript
const result = await call('add', [5, 7]);
```

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `method` | `string` | Name of the Python method |
| `params` | `any[]` | Array of arguments (default: `[]`) |

**Returns:** `Promise<Response>`

```typescript
interface Response {
  success: boolean;
  result?: any;     // Present when success=true
  error?: string;   // Present when success=false
  method: string;   // Echo of called method name
}
```

**Example:**

```javascript
const result = await call('process_data', ['Hello World']);
if (result.success) {
  console.log(result.result.word_count); // 2
} else {
  console.error(result.error);
}
```

## `getPlatform()`

Returns the detected platform.

```javascript
const platform = getPlatform();
// 'desktop' | 'android' | 'dev'
```

| Return Value | Meaning |
|---|---|
| `'desktop'` | Running in pywebview (`window.pywebview.api` exists) |
| `'android'` | Running in Android WebView (`window.NativeBridge` exists) |
| `'dev'` | Running in browser without native host (mock mode) |

## `isBridgeReady()`

Check if the native bridge is available.

```javascript
if (isBridgeReady()) {
  // Safe to make IPC calls
}
```

## Platform Detection

The bridge auto-detects the platform and routes calls accordingly:

| Platform | JS → Native | Native → Python |
|---|---|---|
| Desktop | `pywebview.api.call()` | Direct Python call |
| Android | `NativeBridge.call()` + callback ID | Chaquopy `callAttr()` |
| Dev | Mock handler with simulated latency | N/A |

## Dev Mode Mocks

When running `npm run dev` without a native host, the bridge returns mock responses:

```javascript
// These work even without Python running:
await call('add', [5, 7]);           // → {success: true, result: 12}
await call('get_system_info');       // → {success: true, result: {platform: "Browser (Dev Mode)", ...}}
await call('unknown_method');        // → {success: false, error: "[Dev Mock] Unknown method: 'unknown_method'"}
```

This lets frontend developers iterate on UI without launching the full native stack.

## Android Callback System

On Android, IPC is asynchronous via callbacks:

1. JS generates a unique `callbackId` for each call
2. Passes it to `NativeBridge.call(method, params, callbackId)`
3. Kotlin runs Python on a background thread
4. Result returns via `webView.evaluateJavascript("window.__resolveCallback(id, result)")`
5. The Promise resolves

Includes a **30-second timeout** to prevent hanging if the callback never fires.
