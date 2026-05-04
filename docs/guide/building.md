# Building & Deployment

Once your application is ready, you'll need to package it for your target platforms. This guide covers building standalone executables, Android APKs, and static Web bundles using the unified **PyWebApp CLI**.

## Desktop (Windows EXE / Mac App / Linux Bin)

The CLI uses **PyInstaller** internally to package the Python backend and the built React frontend into a single standalone executable.

### 1. Building the Executable
Run the following command from your project root:

```bash
# Build a standalone executable
pywebapp build-desktop
```

### 2. Output
The final build will be located in the `dist/` directory.
- On Windows, you will get a single `YourApp.exe`.
- On Linux, you will get a portable binary.

::: warning Cross-Compilation
PyInstaller cannot cross-compile. To build a Windows `.exe`, you must run the build command on Windows. To build a macOS `.app`, you must run it on macOS.
:::

---

## Android (Signed Release APK)

The CLI handles the entire Android build pipeline, including frontend bundling, Python syncing, and Gradle signing.

### 1. Building a Release APK
Run the following command:

```bash
# Build a signed release APK
pywebapp build-android

# Build with a custom keystore password
pywebapp build-android --password my_secret_password
```

### 2. What it does automatically
- Builds the React frontend for production.
- Syncs all Python backend code to the Android project.
- Updates the App Name and Icon from `pywebapp.json`.
- Generates a **Release Keystore** if you don't have one.
- Compiles the signed APK via Gradle.

### 3. Output
**Output:** `android/app/build/outputs/apk/release/app-release.apk`

::: tip Keystore Signing
For `assembleRelease` or `bundleRelease` to work, you must have configured your `android/keystore.properties`. See the [Android Platform Guide](/platforms/android.md#keystore-signing) for details.
:::

---

## Web App (Browser Only)

While PyWebApp is designed for native apps with a Python backend, the frontend is a standard React application. 

If your backend logic can be mocked (or if you eventually migrate the backend to a cloud REST API), you can deploy the frontend as a standard web application.

### 1. Build the Static Files
```bash
cd frontend
npm run build
```

### 2. Output
The output is generated in `frontend/dist/`. This folder contains a standard `index.html` and bundled JS/CSS files.

### 3. Deployment
You can deploy the `frontend/dist/` folder to any static hosting service, such as:
- GitHub Pages
- Vercel
- Netlify
- AWS S3 / CloudFront

::: warning Python Backend in the Browser
Currently, standard browsers cannot run Python natively. If you deploy your app to the web, any `call('my_python_func')` will hit the mock dev bridge unless you update `bridge.js` to route those calls to a cloud-hosted Python API (like FastAPI or Flask).
:::
