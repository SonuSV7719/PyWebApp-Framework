# ⌨️ CLI Command Reference

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
- **Features:** 
  - Instant React HMR (Hot Module Replacement).
  - Automatic Python module reloading on the device/desktop.
  - Integrated ADB tunnel management for mobile dev.

---

## 📦 Building & Deployment

### `pywebapp build-android`
A powerful, unified command for mobile debug builds.
- **Flags:**
  - `--debug`: Builds a debug version for rapid testing.
  - `--clean`: (New in v2.3.0) Wipes previous build artifacts to ensure 100% asset accuracy.
  - `--install`: Automatically pushes and launches the APK on your connected device.
- **Example:** `pywebapp build-android --debug --clean --install`
- **Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

### `pywebapp build-android-release`
**Enterprise Secure Release Builder (v2.3.0).** Automates the entire production release pipeline.
- **What it does:** Automatically generates a cryptographically secure (`secrets`-based) keystore if one doesn't exist, injects credentials safely, builds the release AAB/APK bundle, and strips debug symbols.
- **Output:** `android/app/build/outputs/bundle/release/app-release.aab`

### `pywebapp build-desktop`
Generates a standalone, native executable.
- **Platform support:** Windows (`.exe`), Linux (Portable Binary).
- **Features:** Bundles your frontend, backend, and a portable Python engine into a single, high-performance binary.

### `pywebapp build-web`
Generates a production-ready static website.
- **Output:** `frontend/dist`
- **Features:** Optimized for deployment to Netlify, Vercel, or any standard HTTP server.

---

## 🛠️ Testing & Info

### `pywebapp serve`
Starts the universal HTTP server to test web builds.
- **Option:** `--port <port_number>` (Default: 18090)
- **What it does:** Serves your frontend while automatically exposing your Python backend via a secure REST API.

### `pywebapp --version`
Displays your currently installed framework version (Current: **v2.3.0**).

---
[🏠 Back to Home](../)
