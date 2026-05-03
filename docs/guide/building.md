# Building & Deployment

Once your application is ready, you'll need to package it for your target platforms. This guide covers building standalone executables, Android APKs, and static Web bundles.

## Desktop (EXE / Mac App / Linux Bin)

We use **PyInstaller** to package the Python backend and the built React frontend into a single standalone executable.

### 1. Prerequisites
Make sure your frontend is built first:
```bash
cd frontend
npm run build
cd ..
```

Ensure PyInstaller is installed:
```bash
pip install pyinstaller
```

### 2. Building the Executable
Run the included build script:

```bash
# Build as a single executable file (Recommended)
python scripts/build_desktop.py --onefile

# Build as a directory (Faster, easier to debug if something goes wrong)
python scripts/build_desktop.py
```

### 3. Output
The final build will be located in the `desktop/dist/` directory.
- For `--onefile`, you will get a single `PyWebApp.exe` (on Windows) or binary (Mac/Linux).
- For directory mode, you will get a folder containing the executable and all its dependencies.

::: warning Cross-Compilation
PyInstaller cannot cross-compile. To build a Windows `.exe`, you must run the build script on Windows. To build a macOS `.app`, you must run it on macOS.
:::

---

## Android (APK / AAB)

Android builds are handled by Gradle and the Chaquopy plugin.

### 1. Prerequisites
- The frontend must be built.
- The Python files must be synced to the Android project.
Our script handles both:
```bash
python scripts/build_android.py
```

### 2. Building an APK
To build a release APK, you can either use Android Studio (Build > Build Bundle(s) / APK(s) > Build APK(s)), or use the command line:

```bash
cd android
./gradlew assembleRelease
```
**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### 3. Building an App Bundle (AAB) for Google Play
If you intend to publish to the Google Play Store, you must build an Android App Bundle (.aab):

```bash
cd android
./gradlew bundleRelease
```
**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

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
