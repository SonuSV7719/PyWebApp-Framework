# Python Package Compatibility

Which Python packages work on each platform?

## Quick Reference

| Category | Desktop (Win/Mac/Linux) | Android (Chaquopy) |
|----------|:-----------------------:|:-------------------:|
| **Pure Python** packages | ✅ All work | ✅ All work |
| **C-extension with wheels** (numpy, pandas, etc.) | ✅ All work | ⚠️ Only if Chaquopy has a wheel |
| **C-extension without wheels** | ⚠️ Needs compiler | ❌ Won't work |

## Pure Python Packages (Universal ✅)

These work on **all platforms** with no issues:

| Package | Use Case |
|---------|----------|
| `requests` | HTTP client |
| `pydantic` | Data validation |
| `jinja2` | Templating |
| `pyyaml` | YAML parsing |
| `python-dateutil` | Date utilities |
| `jsonschema` | JSON validation |
| `cryptography` | Encryption |
| `beautifulsoup4` | HTML parsing |
| Any package written in pure Python | ✅ |

## Chaquopy-Supported C-Extension Packages

Chaquopy maintains pre-built wheels for many popular packages. As of Chaquopy 16.x:

| Package | Version | Notes |
|---------|---------|-------|
| `numpy` | ✅ | Numerical computing |
| `pandas` | ✅ | Data manipulation |
| `Pillow` | ✅ | Image processing |
| `scipy` | ✅ | Scientific computing |
| `scikit-learn` | ✅ | Machine learning |
| `matplotlib` | ✅ | Plotting (no GUI, use `agg` backend) |
| `opencv-python-headless` | ✅ | Computer vision |
| `sqlalchemy` | ✅ | Database ORM |
| `lxml` | ✅ | XML processing |
| `regex` | ✅ | Advanced regex |
| `msgpack` | ✅ | Binary serialization |

::: tip Full List
See [Chaquopy's package versions page](https://chaquo.com/chaquopy/doc/current/versions.html) for the complete list of supported packages and versions.
:::

## Installing Packages

### Desktop

```bash
pip install numpy pandas Pillow
```

### Android (Chaquopy)

In `app/build.gradle.kts`:

```kotlin
python {
    pip {
        install("numpy")
        install("pandas")
        install("Pillow")
    }
}
```

## Best Practices

### 1. Conditional Imports

For packages that are desktop-only:

```python
import sys

def get_ml_prediction(data):
    try:
        import torch
        # Use PyTorch for ML inference
        return run_model(data)
    except ImportError:
        # Fallback for platforms without torch
        return simple_prediction(data)
```

### 2. Requirements Per Platform

```
# requirements-common.txt (all platforms)
pyyaml
requests

# requirements-desktop.txt
-r requirements-common.txt
numpy
pandas
torch

# requirements-android.txt (in build.gradle.kts pip block)
# Only packages with Chaquopy wheels
numpy
pandas
```

### 3. Testing Compatibility

Before adding a package to your project:

```python
# test_imports.py - run on each target platform
packages = ["numpy", "pandas", "Pillow", "your_package"]

for pkg in packages:
    try:
        __import__(pkg)
        print(f"✅ {pkg}")
    except ImportError as e:
        print(f"❌ {pkg}: {e}")
```
