# Android (Chaquopy)

Setup and configuration for Android devices and emulators.

## Prerequisites

- Android Studio (latest)
- JDK 17+
- Android SDK 34
- Python 3.8+ on your dev machine (for Chaquopy build)

## Project Setup

### 1. Build Frontend + Sync Python

```bash
python scripts/build_android.py
```

This script:
1. Syncs `backend/*.py` → `android/app/src/main/python/` (with import rewrites)
2. Builds the React frontend
3. Copies `frontend/dist/` → `android/app/src/main/assets/web/`

### 2. Open in Android Studio

Open the `android/` directory as a project. Wait for Gradle sync — Chaquopy will download the Python interpreter for your target ABIs.

### 3. Run

Select a device or emulator and click Run.

## Keystore Signing

### Generate a Keystore

```bash
keytool -genkey -v \
  -keystore android/pywebapp-release.keystore \
  -alias pywebapp \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Configure Signing

Copy the template and fill in your values:

```bash
cp android/keystore.properties.template android/keystore.properties
```

Edit `android/keystore.properties`:
```properties
storeFile=pywebapp-release.keystore
storePassword=your_password
keyAlias=pywebapp
keyPassword=your_password
```

::: warning
Never commit `keystore.properties` or `.keystore` files to git. They're in `.gitignore` by default.
:::

### Build Signed APK

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

## Dev Mode

### Frontend Hot Reload

```bash
# Dev machine: start Vite with network access
cd frontend && npm run dev -- --host

# Setup port forwarding to emulator
adb reverse tcp:5173 tcp:5173
```

Set `DEV_MODE = true` in `MainActivity.kt`.

### Python Hot Reload

```bash
# Dev machine: start the sync watcher
python scripts/dev_sync.py
```

This watches `backend/`, pushes changes via ADB, and triggers `importlib.reload()` on the device.

## How Chaquopy Works

1. **Build time**: Chaquopy downloads a Python interpreter for each target ABI (arm64-v8a, x86_64)
2. **APK content**: Python interpreter + your `.py` files are bundled into the APK
3. **Runtime**: `PyApplication` initializes Python on app start
4. **Calling Python**: Kotlin uses `Python.getInstance().getModule("api").callAttr("dispatch_json", ...)`
5. **No server**: Everything runs in-process — no network, no ports

## ABI Configuration

In `app/build.gradle.kts`:

```kotlin
ndk {
    // Include only what you need:
    abiFilters += listOf(
        "arm64-v8a",    // Modern phones (99% of devices)
        "x86_64",       // Emulators
        // "armeabi-v7a" // Older 32-bit devices (optional)
    )
}
```

::: tip
Each ABI adds ~15-20MB to the APK. Only include what you need.
:::
