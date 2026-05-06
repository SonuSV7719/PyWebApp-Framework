# Getting Started

Get PyWebApp running in under 5 minutes.

## Prerequisites

- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **Android Studio** (for Android builds only)

### 1. Install the CLI Framework

```bash
pip install pywebapp-native
```

### 2. Create a New Project

```bash
pywebapp init MyApp
cd MyApp
```

*(This automatically installs the required npm dependencies, including the `pywebapp-bridge` library, and gives you a clean project template!)*

### Production Mode

```bash
# Build the frontend and launch desktop runner
pywebapp build-desktop
```

### Development Mode (High Velocity) 🚀

Just run a single command to launch the **Interactive Dev Menu**. It handles everything from Vite servers to Android ADB tunnels automatically:

```bash
pywebapp dev
```

**Choose your target:**
- **[d] Desktop**: Launches a native Window on your PC with full Hot-Reload.
- **[a] Android**: Performs a clean build, installs the APK, and sets up the live sync tunnel to your phone/emulator.

Now you can:
- **Edit React files** → changes appear instantly (Vite HMR).
- **Edit Python handlers** → modules reload automatically on all devices. 🔄
- **Professional Debugging** → Use Chrome DevTools to inspect your app while it's running on Android!

## Your First IPC Call

The app ships with example handlers. Click the **Calculate** button to call Python's `add()` function from React:

```
User clicks "Calculate"
  → React calls: call('add', [5, 7])
  → bridge.js detects platform (desktop/android/dev)
  → pywebview.api.call('add', '[5, 7]')
  → Python: dispatch('add', [5, 7])
  → Python: add(5, 7) → 12
  → Returns JSON: {"success": true, "result": 12}
  → React displays: 12
```

## Next Steps

- [Architecture](/guide/architecture) — Understand how the layers connect
- [Adding Methods](/guide/adding-methods) — Add your own Python functions
- [Hot Reload](/guide/hot-reload) — Setup for all platforms
