# 🚀 Scaling & Development Guide

One of the greatest strengths of PyWebApp Native is its **Infinite Scalability**. You can add thousands of features without ever touching the native "Plumbing."

---

## 🐍 Adding New Python Methods (Backend)

To add a new feature, you never need to modify the Android Kotlin code or the Desktop C++ code. You only work in Python.

### 1. Simple Registration
Open `backend/handlers.py` and use the `@register` decorator:

```python
@register("get_user_data")
def get_user_data(params):
    user_id = params.get("id")
    # Fetch from database or API
    return {"name": "Sonu", "role": "Lead Architect"}
```

### 2. Organizing into Modules
As your app grows, don't put everything in one file. Create new Python modules!
- Create `backend/database.py`
- Create `backend/auth.py`
- **Important:** Just make sure you import these files in your main entry point so the `@register` decorators are executed.

---

## ⚛️ Calling Methods from React (Frontend)

Once you've added the Python method, calling it from React is a one-liner:

```javascript
import { call } from './bridge';

const loadUser = async () => {
    // The method name MUST match the string in @register("...")
    const { result } = await call("get_user_data", { id: 123 });
    console.log(result.name);
};
```

---

## 📦 Library-Driven Abstraction

PyWebApp abstracts all the complex "plumbing" into two distributable libraries:

1. **`pywebapp-native` (pip)**: The Python engine. Contains the IPC dispatcher, Method Registry, CLI tool, build scripts, and the desktop runner.
2. **`pywebapp-bridge` (npm)**: The cross-platform JavaScript IPC bridge.

Because of this architecture, your workspace remains incredibly clean. You only see your business logic (`backend/handlers.py`) and your UI (`frontend/src/App.jsx`).

### ✅ What You Control:
- **`backend/`**: Your playground! Add as much Python logic as you want across as many modules as you need. Just import them into `backend/__init__.py`.
- **`frontend/`**: Build your beautiful UI here using React/Vite.
- **`pywebapp.json`**: Configure your app's name, version, and identity globally.

---

## 📈 How to Scale
1. **Add a Python function** + `@register`.
2. **Call it from React** with `await call()`.
3. **Build.**
4. **Repeat.** 🚀

---
[🏠 Back to Home](../)
