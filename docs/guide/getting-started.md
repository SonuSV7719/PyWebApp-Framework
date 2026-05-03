# Getting Started

Get PyWebApp running in under 5 minutes.

## Prerequisites

- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **Android Studio** (for Android builds only)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/pywebapp.git
cd pywebapp
```

### 2. Install Backend Dependencies

```bash
cd desktop
pip install -r requirements.txt
cd ..
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Running the App

### Production Mode

```bash
# Build the frontend
cd frontend && npm run build && cd ..

# Launch the desktop app
cd desktop && python main.py
```

### Development Mode (Recommended)

Run two terminals for hot reload on both frontend and backend:

**Terminal 1 — Vite Dev Server (frontend HMR):**
```bash
cd frontend
npm run dev
```

**Terminal 2 — Desktop App with Hot Reload:**
```bash
cd desktop
python main.py --dev --debug
```

Now you can:
- Edit React files → changes appear instantly (Vite HMR)
- Edit Python handlers → modules reload automatically (watchdog)
- Use DevTools to inspect the WebView (debug mode)

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
