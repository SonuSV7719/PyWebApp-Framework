# Desktop (pywebview)

Setup and configuration for Windows, macOS, and Linux.

## Prerequisites

- Python 3.9+
- pip

## Installation

```bash
cd desktop
pip install -r requirements.txt
```

This installs:
- `pywebview` — Native WebView wrapper
- `watchdog` — File watcher for hot reload
- `pyinstaller` — Packaging (optional)

## Running

### Production
```bash
cd frontend && npm run build && cd ..
cd desktop && python main.py
```

### Development (hot reload)
```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd desktop && python main.py --dev --debug
```

### CLI Options

| Flag | Description |
|------|-------------|
| `--dev` | Load from Vite dev server + enable Python hot reload |
| `--debug` | Enable DevTools (right-click → Inspect) |
| `--width N` | Window width in pixels (default: 900) |
| `--height N` | Window height in pixels (default: 700) |

## Packaging with PyInstaller

```bash
# Directory bundle (recommended for debugging)
python scripts/build_desktop.py

# Single executable
python scripts/build_desktop.py --onefile
```

Output: `dist/PyWebApp/` or `dist/PyWebApp.exe`

## Platform Notes

### Windows
- Uses Edge WebView2 (Chromium-based)
- WebView2 runtime usually pre-installed on Windows 10/11

### macOS
- Uses WebKit (Safari engine)
- No additional runtime needed

### Linux
- Uses WebKitGTK
- Install: `sudo apt install python3-gi gir1.2-webkit2-4.1` (Ubuntu/Debian)
