# 🏛️ PyWebApp Native: The Official Guide

Welcome to the **PyWebApp Native** documentation. This framework is designed for high-performance, cross-platform application development.

### 🗺️ Explore the Framework
[🚀 Quick Start](#-quick-start-30-seconds) | [📱 Android Guide](./android) | [💻 Desktop Guide](./desktop) | [💰 Licensing](#-licensing)

---

## 🚀 Quick Start (30 Seconds)

To start building apps with the Elite framework, run the following command in your terminal:

```bash
pip install pywebapp-native
```

### 1. Initialize your first project
```bash
pywebapp init MyNewApp
cd MyNewApp
```

### 2. Run in Development Mode
This starts the hot-reload server so you can see changes instantly.
```bash
pywebapp dev
```

### 3. Build for Production
When you are ready to ship, use the universal build commands:
- **Android:** `pywebapp build-android`
- **Windows:** `pywebapp build-desktop`
- **Web:** `pywebapp build-web`

---

## 🏛️ Architecture Overview
PyWebApp uses a **Master Hub** system. 
- **Frontend:** React + Vite (GPU Accelerated)
- **Backend:** Python (Asynchronous Logic)
- **Bridge:** A universal hardware interface that works on Mobile, Desktop, and Web.

---

## 🛠️ Advanced Usage

### Accessing Hardware
You can trigger native intents and hardware features directly from your JS code:
```javascript
import { openCamera, pickFile } from './bridge';

// Open Native Camera
const photo = await openCamera();

// Pick any File
const file = await pickFile();
```

---

## 💰 Licensing
PyWebApp Native is free for **Personal & Open Source** use. 
For commercial licenses, please contact:
👉 **Sonu Vishwakarma** (`sonuportfolio77@gmail.com`)

---

© 2026 PyWebApp Native. Built with ❤️ by Sonu Vishwakarma.
