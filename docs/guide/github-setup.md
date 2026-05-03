# 🛠️ GitHub Setup & Contributor Guide

This guide is for developers who want to **clone the PyWebApp repository** and use the internal scripts to build or modify the framework.

## 🏗️ Local Environment Setup

If you have cloned the repo, you need to set up the developer dependencies:

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Set up the Frontend
cd frontend
npm install
npm run build
```

---

## 📦 Using Internal Build Scripts

These scripts are located in the `scripts/` folder and are designed for building the framework itself or testing new features.

### 📱 Android GitHub Build
To build the Android app using the internal shell scripts:
```bash
# On Linux/Mac
bash scripts/build_android.sh

# On Windows (PowerShell)
python scripts/build_android.py
```
*Note: This will use the local `android/` source code and Gradle files.*

### 💻 Desktop GitHub Build
To generate the EXE using the internal Python logic:
```bash
python scripts/build_desktop.py
```

---

## 🏛️ Repository Architecture
For a deep dive into how these files are organized, see our **[Architecture Guide](./architecture)**.

---
[🏠 Back to Home](../)
