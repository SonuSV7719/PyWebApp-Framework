# Architecture

PyWebApp uses a layered architecture where each layer has a single responsibility. The key insight: **a single `call(method, params)` contract** connects everything.

## System Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI["React UI<br/>(App.jsx)"]
        Bridge["bridge.js<br/>call(method, params)"]
    end
    
    subgraph "Native Bridge Layer"
        Desktop["Desktop<br/>pywebview js_api"]
        Android["Android<br/>@JavascriptInterface"]
    end
    
    subgraph "Python Backend"
        API["api.py<br/>dispatch()"]
        Registry["registry.py<br/>MethodRegistry"]
        Handlers["handlers.py<br/>@register functions"]
        Logger["logger.py"]
    end
    
    UI --> Bridge
    Bridge -->|"pywebview.api.call()"| Desktop
    Bridge -->|"NativeBridge.call()"| Android
    Desktop -->|"Direct Python"| API
    Android -->|"Chaquopy callAttr()"| API
    API --> Registry
    Registry --> Handlers
    API --> Logger
```

## Layer Responsibilities

### 1. Frontend Layer (React + Vite)

| Component | File | Responsibility |
|-----------|------|----------------|
| UI | `App.jsx` | User interface, state management |
| Bridge | `bridge.js` | Platform detection, IPC abstraction |
| Components | `components/` | Reusable UI elements |

The frontend is **platform-agnostic**. It never knows if it's running in pywebview, an Android WebView, or a browser. The `bridge.js` module handles all platform detection.

### 2. Native Bridge Layer

This is the thinnest possible layer — its only job is to shuttle `call(method, paramsJson)` between JS and Python:

| Platform | Mechanism | File |
|----------|-----------|------|
| Desktop | `pywebview.api.call()` → direct Python | `desktop/bridge.py` |
| Android | `@JavascriptInterface` → Chaquopy `callAttr()` | `PythonBridge.kt` |

::: tip Why a thin bridge?
By keeping the bridge layer thin (one method), you never need to modify it when adding new Python functions. All routing happens in Python's dispatcher.
:::

### 3. Python Backend

The backend is 100% platform-independent:

```mermaid
graph LR
    Call["call('add', [5, 7])"] --> Dispatch["dispatch()"]
    Dispatch --> Registry["MethodRegistry"]
    Registry --> PreMW["Pre-Middleware"]
    PreMW --> Handler["add(5, 7)"]
    Handler --> PostMW["Post-Middleware"]
    PostMW --> Result["{'success': true, 'result': 12}"]
```

| Component | File | Responsibility |
|-----------|------|----------------|
| Dispatcher | `api.py` | Routes method calls, error handling |
| Registry | `registry.py` | `@register` decorator, middleware, introspection |
| Handlers | `handlers.py` | Business logic functions |
| Logger | `logger.py` | Cross-platform file + console logging |

## IPC Contract

Every IPC call follows this contract:

**Request:**
```typescript
call(method: string, params: any[]): Promise<Response>
```

**Response:**
```typescript
interface Response {
  success: boolean;
  result?: any;     // Present on success
  error?: string;   // Present on failure
  method: string;   // Echo of called method
}
```

## Data Flow: Desktop vs Android

### Desktop (pywebview)

```mermaid
sequenceDiagram
    participant JS as React (JS)
    participant PW as pywebview
    participant PY as Python

    JS->>PW: pywebview.api.call("add", "[5,7]")
    PW->>PY: BridgeApi.call("add", "[5,7]")
    PY->>PY: dispatch_json("add", "[5,7]")
    PY->>PY: add(5, 7) → 12
    PY-->>PW: '{"success":true,"result":12}'
    PW-->>JS: Promise resolves with result
```

**Key point:** Everything runs in the **same process**. The call is essentially a Python function call — sub-millisecond latency.

### Android (Chaquopy)

```mermaid
sequenceDiagram
    participant JS as React (JS)
    participant KT as Kotlin Bridge
    participant PY as Python (Chaquopy)

    JS->>KT: NativeBridge.call("add","[5,7]","cb_1")
    Note over KT: Runs on background thread
    KT->>PY: apiModule.callAttr("dispatch_json","add","[5,7]")
    PY->>PY: add(5, 7) → 12
    PY-->>KT: '{"success":true,"result":12}'
    KT->>JS: evaluateJavascript("__resolveCallback('cb_1', result)")
    JS->>JS: Promise resolves via callback
```

**Key point:** Python runs on a **background thread** (thread pool of 4) to avoid blocking the Android UI thread. Results are posted back via `evaluateJavascript()`.

## Directory Map

```
pywebapp/
├── frontend/          ← Platform-agnostic React UI
├── backend/           ← Platform-agnostic Python logic
├── desktop/           ← Thin pywebview host
├── android/           ← Thin Kotlin + Chaquopy host
├── docs/              ← This documentation site
├── scripts/           ← Build & dev tooling
└── tests/             ← Python test suite
```
