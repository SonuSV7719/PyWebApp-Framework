# Hot Reload

PyWebApp supports hot reload for **both frontend and backend** during development. Edit code, see changes instantly — no app restart.

## Overview

| Layer | Mechanism | Platforms |
|-------|-----------|-----------|
| **Frontend (React)** | Vite HMR (Hot Module Replacement) | Desktop, Android |
| **Backend (Python)** | `importlib.reload()` + `watchdog` | Desktop |
| **Backend (Python)** | ADB push + `importlib.reload()` | Android |

## Desktop Hot Reload

### Setup

```bash
# Terminal 1: Vite dev server (frontend HMR)
cd frontend
npm run dev

# Terminal 2: Desktop app with hot reload
cd desktop
python main.py --dev --debug
```

### What Happens

1. **Frontend**: Vite's HMR detects file changes in `frontend/src/` and pushes updates to the WebView instantly — no page refresh needed.

2. **Backend**: The `watchdog` file watcher monitors `backend/` for `.py` changes:
   - Detects save → debounces (300ms)
   - Calls `importlib.reload()` on changed modules
   - Refreshes the `MethodRegistry` (re-executes `@register` decorators)
   - Optionally sends a notification to the WebView

### Example Flow

```
You edit backend/handlers.py
  → watchdog detects change
  → importlib.reload(backend.handlers)
  → importlib.reload(backend.api)
  → Registry refreshed with new function code
  → Next IPC call uses the updated function
  → No restart needed!
```

## Android Hot Reload

### Frontend HMR

```bash
# On dev machine: start Vite with network access
cd frontend
npm run dev -- --host

# Setup ADB reverse port forwarding
adb reverse tcp:5173 tcp:5173
```

In `MainActivity.kt`, set `DEV_MODE = true`. The app will load from `http://10.0.2.2:5173` (emulator) and receive Vite HMR updates.

### Backend Reload (via ADB Sync)

```bash
# On dev machine: start the sync watcher
python scripts/dev_sync.py
```

This script:
1. Watches `backend/` for `.py` file changes
2. Rewrites imports for Chaquopy compatibility
3. Pushes updated files to the device via `adb push`
4. Sends a broadcast to trigger `importlib.reload()` in the running app

### Android Dev Workflow

```
You edit backend/handlers.py
  → dev_sync.py detects change
  → adb push handlers.py /data/local/tmp/pywebapp/python/
  → adb broadcast RELOAD_PYTHON
  → DevReloadReceiver triggers importlib.reload()
  → Python modules refreshed on device
  → Next IPC call uses updated code
```

### Full Android Dev Setup

```bash
# Terminal 1: Vite dev server
cd frontend && npm run dev -- --host

# Terminal 2: ADB sync (Python hot reload)
python scripts/dev_sync.py

# In Android Studio:
# Set DEV_MODE = true in MainActivity.kt
# Run the app on emulator
```

## Important Notes

::: warning Development Only
Hot reload is for development only. In production builds:
- Frontend loads from bundled static files
- Python loads from the APK (Android) or bundled package (desktop)
- No file watchers, no network loading
:::

::: tip Module Reload Limitations
`importlib.reload()` re-executes the module code, but objects already in memory keep their old references. This works perfectly for the `@register` pattern because decorators re-register on reload. For stateful code, be aware that existing instances won't update.
:::
