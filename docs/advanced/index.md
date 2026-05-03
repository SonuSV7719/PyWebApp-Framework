# 🛠️ Advanced Framework Usage

Once you master the basics, you can extend the framework to do almost anything.

## 📦 Adding Third-Party Python Libraries

If your Python backend needs external packages (like `requests`, `numpy`, or `beautifulsoup4`), you must declare them so the build system includes them in your App/EXE.

1. Open `pyproject.toml`.
2. Add your package to the `dependencies` list:
```toml
dependencies = [
    "pywebview>=4.0",
    "pyinstaller>=5.0",
    "requests",
    "numpy" # <--- Added here
]
```
3. Rebuild your app (`pywebapp build-android` or `pywebapp build-desktop`).

---

## 🎨 Customizing the React Frontend

The framework uses **Vite** for the frontend, which means you can use any React library you want (TailwindCSS, Framer Motion, Material UI).

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install your library:
   ```bash
   npm install framer-motion
   ```
3. Import and use it in `App.jsx` just like a normal web app!

---

## 🔐 Advanced Android Build Properties

If you need to change the App Name, App Icon, or Version Number for Android:
- **App Name:** Edit `android/app/src/main/res/values/strings.xml`
- **Version Code/Name:** Edit `android/app/build.gradle.kts`
- **App Icon:** Replace the images in `android/app/src/main/res/mipmap-*`

---
[🏠 Back to Home](../)
