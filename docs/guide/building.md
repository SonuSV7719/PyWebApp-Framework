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

PyWebApp includes a powerful universal server that allows you to deploy your frontend and Python backend to the web.

### 1. Build the Static Files
Run the following command from your project root:

```bash
# Build the production frontend
pywebapp build-web
```

### 2. Test Locally
Use the built-in server to test the web build with your real Python backend:

```bash
# Start the web server and Python API
pywebapp serve
```
Your app will be available at `http://localhost:18090`. Any Python functions called from React will hit the live Python backend via REST API.

### 3. Deployment
The output is generated in `frontend/dist/`. 

To deploy to production, you can host the static files on a CDN (Vercel, Netlify, S3) and host your PyWebApp Python server on a cloud provider (Render, AWS, DigitalOcean). The bridge automatically detects when it's running on the web and sends IPC calls over standard HTTP!
