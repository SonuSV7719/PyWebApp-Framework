# 📚 Core API Reference

The complete technical specification for the PyWebApp Native bridge.

## 📡 JavaScript API
- `openCamera()`: Triggers the native system camera.
- `pickFile(options)`: Opens the universal file picker.
- `dispatch(method, params)`: The master bridge for Python communication.

## 🐍 Python API
- `api.dispatch()`: The entry point for all frontend requests.
- `context.get_app()`: Access the global application state.

---
[🏠 Back to Home](../)
