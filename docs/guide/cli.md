# ⌨️ CLI Command Reference (v2.4.0)

The `pywebapp` command-line tool is the high-performance heart of the framework. It automates complex native tasks so you can focus on building your app.

---

## 🏗️ Project Lifecycle

### `pywebapp init <ProjectName>`
Scaffolds a brand new, production-ready project.
- **Example:** `pywebapp init MyApp`
- **What it does:** Clones the framework template and prepares the `frontend/`, `backend/`, and `android/` directories.
- **Next Steps:** Navigate into `MyApp` and run `pywebapp dev`.

### `pywebapp dev`
Starts the high-velocity, interactive development environment.
- **Interactive Menu:**
  - Press **[d]** for **Desktop Mode**: Launches a native window with Python hot-reload.
  - Press **[a]** for **Android Mode**: Automatically performs a clean debug build, installs it to your device, and sets up ADB port forwarding for your React UI.
  - Press **[w]** for **Web Mode**: Launches a browser-only development environment with a live Python API server.
- **Flags:**
  - `--android`: Start directly in Android mode.
  - `--desktop`: Start directly in Desktop mode.
  - `--web`: Start directly in Web mode.
  - `--port <number>`: Change the dev server port (Default: 5173).
- **Features:** 
  - Instant React HMR (Hot Module Replacement).
  - Automatic Python module reloading on the device/desktop.
  - Integrated ADB tunnel management for mobile dev.

---

## 📦 Building & Deployment

### `pywebapp build-android`
A powerful, unified command for mobile builds. **Note: In v2.4.0+, this defaults to a Release Build.**
- **Flags:**
  - `--debug`: Builds a debug version for rapid testing (skips signing).
  - `--clean`: Wipes previous build artifacts to ensure 100% asset accuracy.
  - `--install`: Automatically pushes and launches the APK on your connected device.
  - `--password <pass>`: Provide the keystore password for release signing.
- **Example (Dev):** `pywebapp build-android --debug --clean --install`
- **Example (Release):** `pywebapp build-android --password mysecurepass`

### `pywebapp build-desktop` / `build-linux`
Generates a standalone, native executable.
- **Platform support:** Windows (`.exe`), Linux (Portable Binary).
- **Features:** Bundles your frontend, backend, and a portable Python engine into a single binary.

### `pywebapp build-web`
Generates a production-ready static website.
- **Output:** `frontend/dist`
- **Features:** Optimized for deployment to Netlify, Vercel, or any standard HTTP server.

---

## 🛠️ Testing & Info

### `pywebapp serve`
Starts the universal production-like server to test web builds.
- **Option:** `--port <port_number>` (Default: 5173)
- **What it does:** Serves your built frontend (from `frontend/dist`) while automatically exposing your Python backend via a secure REST API.
- **Example:** `pywebapp build-web && pywebapp serve`

### `pywebapp --version`
Displays your currently installed framework version (Current: **v2.4.0**).

---
[🏠 Back to Home](../)
