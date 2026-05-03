# ⚙️ Configuration Guide (`pywebapp.json`)

The `pywebapp.json` file is the **Single Source of Truth** for your application's branding and identity. Instead of manually editing Android XMLs or build scripts, you control everything from this one file.

## 📄 File Schema

Every new project comes with a default `pywebapp.json` in the root directory:

```json
{
  "app_name": "My Amazing App",
  "app_version": "1.0.0",
  "app_id": "com.company.myapp",
  "icon_path": "assets/logo.png"
}
```

### 🔑 Key Properties
- **`app_name`**: The human-readable name of your app. This appears in the Android app drawer, the Windows taskbar, and the browser tab title.
- **`app_version`**: The semantic version of your app.
- **`app_id`**: The unique package identifier (primarily used for Android builds).
- **`icon_path`**: The relative path to your app's logo. If this file is missing, the framework will gracefully fall back to default icons.

---

## 🚀 How it Works
When you run a build command, the framework automatically "injects" these values into the native layers:

- **Desktop:** Sets the PyInstaller `--name` and `--icon` flags.
- **Android:** Synchronizes the `<string name="app_name">` in `strings.xml`.
- **Web:** Sets the `%VITE_APP_NAME%` environment variable for the browser tab title.

## 🛠️ Modifying the Config
1. Open `pywebapp.json` in your project root.
2. Update the values.
3. Run your build command (e.g., `pywebapp build-android`).
4. **Done!** The changes are applied automatically.

---
[🏠 Back to Home](../)
