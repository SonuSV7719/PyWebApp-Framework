# ⚙️ Configuration Guide (`pywebapp.json`)

The `pywebapp.json` file is the **Single Source of Truth** for your application's branding and identity. Instead of manually editing Android XMLs or build scripts, you control everything from this one file.

## 📄 Master Schema (v2.3.0)

As of v2.3.0, you can now specify **Platform Overrides** for a more tailored experience:

```json
{
  "app_name": "My Amazing App",
  "app_version": "1.0.0",
  "app_id": "com.company.myapp",
  "icon_path": "assets/logo.png",
  "android": {
    "app_name": "My App Mobile",
    "splash_image": "assets/splash.png"
  },
  "desktop": {
    "app_name": "My App Pro",
    "window_width": 1280
  }
}
```

### 🔑 Global Properties
- **`app_name`**: The default name for all platforms.
- **`app_version`**: The semantic version of your app.
- **`app_id`**: The unique package identifier (e.g., `com.company.myapp`).
- **`icon_path`**: The default logo path (used for Desktop taskbar and Android icons).

### 📱 Android Overrides
- **`app_name`**: Override the name specifically for the Android app drawer.
- **`icon_path`**: Provide a specific icon for mobile.
- **`splash_image`**: **(New in v2.3.0)** The image to show on the native Android Splash Screen during startup.

### 💻 Desktop Overrides
- **`app_name`**: Override the name for the Windows/Mac executable.
- **`window_width` / `window_height`**: Set the default launch size of the desktop window.

### 🌐 Web & Server Properties
- **`cors_origins`**: **(New in v2.3.0)** Array of allowed CORS origins for web deployments. Defaults to local-only for maximum security `["http://localhost:*", "http://127.0.0.1:*", "http://[::1]:*"]`. Override with `["*"]` or specific domains for public cloud deployment.

---

## 🚀 How it Works
When you run a build command, the framework automatically "injects" these values into the native layers:

1. **Hierarchy**: The framework looks for a platform-specific value (e.g., in `android`). If not found, it falls back to the global value.
2. **Android Sync**: Updates `strings.xml`, generates Adaptive Icons, and builds the Splash Screen resources.
3. **Desktop Sync**: Sets the PyInstaller `--name` and `--icon` flags.
4. **Web Sync**: Sets the `%VITE_APP_NAME%` environment variable for the browser tab.

## 🛠️ Modifying the Config
1. Open `pywebapp.json` in your project root.
2. Update the values.
3. Run your build command (e.g., `pywebapp build-android`).
4. **Done!** The changes are applied automatically.

---
[🏠 Back to Home](../)
