# ⌨️ CLI Command Reference

The `pywebapp` command-line tool is the heart of the framework. It handles everything from project creation to multi-platform building.

---

## 🏗️ Project Lifecycle

### `pywebapp init <ProjectName>`
Scaffolds a brand new, production-ready project.
- **Example:** `pywebapp init MyApp`
- **What it does:** Creates the `frontend/`, `backend/`, and `android/` directories with all necessary configurations.
- **Next Steps:** Navigate into `MyApp/frontend` and run `npm install` to download React dependencies.

### `pywebapp dev`
Starts the high-performance development environment.
- **What it does:** 
  - Launches a hot-reloading React server.
  - Starts the Python backend bridge.
  - Enables instant previews of your changes.

---

## 📦 Production Building

### `pywebapp build-android`
Generates a signed, production-ready APK for Android devices.
- **Option:** `--password <your_password>` (Optional: Password for the auto-generated release keystore)
- **Output:** `android/app/build/outputs/apk/release/app-release.apk`

### `pywebapp build-desktop`
Generates a standalone Windows `.exe` file.
- **Output:** `dist/MyApp.exe`
- **Features:** Bundles your frontend, backend, and a portable Python engine into one file.

### `pywebapp build-linux`
Generates a portable binary for Linux distributions.
- **Output:** `dist/MyApp` (executable)

### `pywebapp build-web`
Generates a production-ready static website.
- **Output:** `frontend/dist`
- **Features:** Optimized build that can be served via any HTTP server.

### `pywebapp serve`
Starts the universal HTTP server to test your web builds with a live Python API.
- **Option:** `--port <port_number>` (Default: 18090)
- **What it does:** Serves your frontend while automatically running your Python backend functions via REST API.

---

## 🛠️ Maintenance & Info

### `pywebapp --version`
Displays your currently installed framework version.

---
[🏠 Back to Home](../)
