# PyWebApp Native 🚀💎

**Lead Architect:** Sonu Vishwakarma (`sonuportfolio77@gmail.com`)

PyWebApp Native is a high-performance, ultra-scalable cross-platform development platform. It combines the power of **Python** (for logic and data) with **React** (for stunning UIs) to create native Android, Desktop, and Web applications.

---

## 🔥 Key Elite Features
- **🚀 Master Hub Architecture:** A universal hardware bridge that allows Python/JS to trigger ANY feature (Camera, Files, GPS) across Android, Windows, and Web.
- **🌐 Single-File Web Engine:** Generates standalone web builds that work directly from the file system without CORS issues.
- **🏎️ Quad-Platform Build System:** One command to generate APKs, EXEs, Linux binaries, and static web assets.
- **🛡️ Production Hardened:** Pre-configured encoding shields and I/O safety for windowed desktop environments.

---

## 🛠️ Installation & Quick Start

```bash
# 1. Install the Elite Framework globally
pip install pywebapp-native

# 2. Create your new masterpiece
pywebapp init MyProject
cd MyProject

# 3. Launch Development Server (with Hot-Reload)
pywebapp dev

# 4. Build for your target platform
pywebapp build-android    # Generates Signed APK
pywebapp build-desktop    # Generates Windows EXE
pywebapp build-web        # Generates CORS-free Web Site
```

---

## 🏛️ Developer Guide: God-Mode Capabilities

### 📸 1. Accessing the Camera
No native code required. Simply call the God-Mode intent from your React UI:
```javascript
import { launchIntent } from './bridge';

const openCamera = async () => {
  await launchIntent('android.media.action.IMAGE_CAPTURE');
};
```

### 📁 2. Universal File Picker
Pick any file (PDF, Zip, Image) from the system storage:
```javascript
import { pickFile } from './bridge';

const selectFile = async () => {
  const response = await pickFile();
  if (response.success) {
    console.log("File URI:", response.uri);
  }
};
```

### 🔐 3. Dynamic Permissions
Request Android permissions on-the-fly:
```javascript
import { requestPermission } from './bridge';

const checkCamera = async () => {
  await requestPermission('android.permission.CAMERA');
};
```

---

## 📦 Production Building

| Platform | Command |
| :--- | :--- |
| **Android APK** | `pywebapp build-android` |
| **Linux Binary** | `pywebapp build-linux` |
| **Windows EXE** | `pywebapp build-desktop` |
| **Web App** | `pywebapp build-web` |

---

## 🚢 How to Publish to PyPI
To share this framework with the world:

1. **Install Twine:** `pip install twine build`
2. **Build Distribution:** `python -m build`
3. **Upload:** `twine upload dist/*`

---

## 💰 Commercial Licensing
PyWebApp is free for **Personal & Open Source** use. However, **Commercial use requires a paid license.** 

If you are a company, startup, or freelancer building profit-making products, please contact:
👉 **Sonu Vishwakarma** (`sonuportfolio77@gmail.com`)

---

## 📜 License
Developed by **Sonu Vishwakarma**. (c) 2026. All rights reserved.
Non-Commercial Use: Free | Commercial Use: Paid License Required.
