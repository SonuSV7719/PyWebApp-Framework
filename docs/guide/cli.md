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
Generates a single-file static website.
- **Output:** `frontend/dist/index.html`
- **Features:** Inlines all JS/CSS to bypass CORS/Origin issues. Works directly from a USB stick!

---

## 🛠️ Maintenance & Info

### `pywebapp --version`
Displays your currently installed framework version.

---
[🏠 Back to Home](../)
