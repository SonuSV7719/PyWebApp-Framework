# 🏗️ Tutorial: Building Modular Applications (v2.1.0+)

In this tutorial, we will build a **Modular Document Processor**. We will organize our code using the new recursive backend synchronization to keep our project clean and professional.

## 📁 The Project Structure
We will organize our logic into a clean, enterprise-grade folder structure inside the `backend/` directory:

```text
MyModularApp/
├── backend/
│   ├── auth/
│   │   └── security.py      (User Authentication)
│   ├── processor/
│   │   ├── image.py         (Image Processing Logic)
│   │   └── text.py          (Text Analysis Logic)
│   └── handlers.py          (Main Dispatcher)
├── frontend/
└── pywebapp.json
```

---

## 🔐 1. Authentication Module
Create `backend/auth/security.py`:

```python
from pywebapp.core import register, get_logger

logger = get_logger("auth")

@register("auth.login", namespace="security")
def login(username, password):
    logger.info(f"Login attempt for: {username}")
    if username == "admin" and password == "secret":
        return {"success": True, "token": "session_123"}
    return {"success": False, "error": "Invalid credentials"}
```

---

## 🖼️ 2. Image Processing Module
Create `backend/processor/image.py`:

```python
import os
from pywebapp.core import register, get_logger

logger = get_logger("images")

@register("img.get_metadata")
def get_image_info(file_path):
    # Demonstrate native speed for massive files
    if os.path.exists(file_path):
        size = os.path.getsize(file_path)
        return {"size_kb": size / 1024, "path": file_path}
    return {"error": "File not found"}
```

---

## 📝 3. Text Processing Module
Create `backend/processor/text.py`:

```python
from pywebapp.core import register

@register("text.analyze")
def analyze_text(text):
    return {
        "word_count": len(text.split()),
        "char_count": len(text)
    }
```

---

## ⚛️ 4. Calling from React
Since the framework **automatically discovers** all these files, you can call them directly from your UI without any extra setup:

```javascript
import { call } from 'pywebapp-bridge';

// Call the Login method (deeply nested in backend/auth/security.py)
const loginResult = await call('security.auth.login', ['admin', 'secret']);

// Call the Image processor (deeply nested in backend/processor/image.py)
const imgResult = await call('img.get_metadata', ['/path/to/my/photo.jpg']);

// Call the Text analyzer (deeply nested in backend/processor/text.py)
const textResult = await call('text.analyze', ['Hello World!']);
```

---

## 🚀 Why this works
1. **Recursive Sync**: When you run `pywebapp build-android`, the CLI recreates your folders (`auth/`, `processor/`) on the device.
2. **Auto-Discovery**: On startup, the framework walks through your folders and automatically imports every `@register` decorator.
3. **Namespacing**: You can use the `namespace` argument in `@register` to keep your methods organized (e.g., `security.auth.login`).

### Benefits
*   **Team Collaboration**: Different developers can work on different folders.
*   **Code Reusability**: You can drop entire folders (like `auth/`) into a new project.
*   **Maintainability**: No more 5000-line `handlers.py` files!

---

© 2026 PyWebApp Native. Build modular, build elite.
