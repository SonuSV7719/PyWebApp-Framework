# ⚙️ Configuration Reference

The `pywebapp.json` file is the **Single Source of Truth** for your application's branding and identity. Instead of manually editing Android XMLs or build scripts, you control everything from this one file.

---

## 📄 Full Master Schema (v2.4.0)

Every field in the schema is optional but highly recommended for a professional look.

```json
{
  "app_name": "My Amazing App",
  "app_version": "1.0.0",
  "app_id": "com.company.myapp",
  "icon_path": "assets/logo.png",
  "android": {
    "app_name": "My App Mobile",
    "icon_path": "assets/mobile-logo.png",
    "splash_image": "assets/splash.png"
  },
  "desktop": {
    "app_name": "My App Pro",
    "window_width": 1280,
    "window_height": 720
  },
  "cors_origins": [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "http://[::1]:*"
  ]
}
```

---

## 🔑 Key Definitions

### 🏢 Core Properties
- **`app_name`**: The global name of your application.
- **`app_version`**: Version string (e.g., `1.2.3`). Used for installers and APK metadata.
- **`app_id`**: A unique package identifier (e.g., `com.mycompany.app`). Critical for Android and Desktop app isolation.
- **`icon_path`**: Relative path to your global app icon (PNG recommended).

### 📱 Android Overrides
- **`app_name`**: Override the name specifically for the Android app drawer.
- **`icon_path`**: Provide a specific icon for mobile.
- **`splash_image`**: **(New in v2.4.0)** The image to show on the native Android Splash Screen during startup.

### 💻 Desktop Overrides
- **`app_name`**: Override the name for the Windows/Mac executable.
- **`window_width`**: Default width of the application window on launch.
- **`window_height`**: Default height of the application window on launch.

### 🌐 Web & Server Properties
- **`cors_origins`**: **(New in v2.4.0)** Array of allowed CORS origins for web deployments. Defaults to local-only for maximum security. Use `["*"]` to allow any origin (not recommended for production).

---
[🏠 Back to Home](../)
