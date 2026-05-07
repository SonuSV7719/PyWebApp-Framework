# Android (Native Performance)

PyWebApp-Native provides a zero-friction experience for deploying Python/React applications to Android using [Chaquopy](https://chaquo.com/chaquopy/).

## Prerequisites

- **Android Studio** (Koala or later recommended)
- **JDK 17+**
- **Android SDK 34+**
- **Python 3.8+** on your development machine

## Professional Branding (New in v2.4.0)

Branding is now managed centrally via `pywebapp.json`. The framework handles the complex Android resource generation for you.

### 1. Configure Overrides
Add an `android` block to your `pywebapp.json` to customize the mobile experience:

```json
{
  "app_name": "My Amazing App",
  "app_id": "com.company.myapp",
  "icon_path": "assets/logo.png",
  "android": {
    "app_name": "My App Mobile",
    "icon_path": "assets/mobile-logo.png",
    "splash_image": "assets/splash.png"
  }
}
```

### 2. Splash Screens
PyWebApp v2.4.0 features a native splash screen system that hides Python's "warm-up" time.
- **Auto-Generation**: Place your logo in the `assets/` folder and point to it in `pywebapp.json`.
- **Dismissal Control**: You can precisely control when the splash screen disappears:
    - **Python**: `from pywebapp.core import hide_splash; hide_splash()`
    - **JavaScript**: `window.NativeBridge.hideSplash()`

### 3. Adaptive Icons
The builder automatically generates Square, Round, and Adaptive icons from your source image, ensuring your app looks premium on all Android versions.

## Development Workflow

### Interactive Dev Mode (Recommended)
Launch the interactive menu and select **[a] Android**:
```bash
pywebapp dev
```
Selecting Android will automatically:
1.  Perform a **Clean Build** of the debug APK. 🧼
2.  **Install** the APK to your active device or emulator. 📲
3.  Setup **ADB Port Forwarding** for the React Vite server. 🛰️
4.  Start the **Live Sync** engine for Python "Hot Reload." 🔄

### Manual Deployment
For granular control, use the dedicated build command:
```bash
# Build, Clean, and Install a fresh Debug version
pywebapp build-android --debug --clean --install
```

## Production & Release

### 1. Keystore Signing & Release
In v2.4.0, the release pipeline is fully automated and secured. Use the dedicated release command:

```bash
# Generate a cryptographically secure, release-ready AAB/APK
pywebapp build-android-release
```
The framework uses a CSPRNG (`secrets`) to generate passwords and automatically manages the `keystore.properties`.

### 2. ABI Optimization
By default, the framework builds for `arm64-v8a` (modern phones) and `x86_64` (emulators). To reduce APK size, adjust the `abiFilters` in `android/app/build.gradle.kts`.

## How it Works (v2.4.0)

1.  **Enterprise Security**: The Kotlin bridge natively sanitizes all incoming IPC calls to strictly prevent XSS and JSON injection vectors.
2.  **Thread-Safe Registry**: The framework uses a thread-safe registry with 30-second timeouts to handle concurrent calls without thread pool starvation.
3.  **Robust Discovery**: Python handlers are automatically discovered using path-direct, isolated imports, ensuring a scalable enterprise architecture.
4.  **Native Interop**: Python logic runs in-process via JNI, providing near-native execution speed for ML, data processing, and system tasks.

