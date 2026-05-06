# 🔐 Mastering Android Permissions

To use native features like the Camera, GPS, or Storage, you need to handle permissions in two places.

## 1. The Manifest (The Declaration)
Open `android/app/src/main/AndroidManifest.xml` and add the permission you need:

```xml
<!-- Example: Adding GPS Permission -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## 2. The Request (Universal)

You can now request permissions from **either** JavaScript or Python. 

### A. The Python Way (Best for Backend Logic)
This is the new **Universal** way. Use the `permissions` plugin to handle everything in one language.

```python
from pywebapp.plugins import permissions

@register()
def start_camera():
    # 1. Ask for permission (Blocks until user clicks Allow/Deny)
    if permissions.request(permissions.CAMERA):
        print("Access granted! Opening camera...")
        # Your camera logic here
    else:
        print("User denied camera access.")
```

> [!TIP]
> Type `permissions.` in your editor to see a list of all common permissions!

### B. The JavaScript Way (React UI)
In your React code, use the bridge to request the permission:

```javascript
import { requestPermission } from 'pywebapp-bridge';

const enableGPS = async () => {
  const granted = await requestPermission('android.permission.ACCESS_FINE_LOCATION');
  // ...
};
```

---

## 📸 Common Permissions Reference
| Feature | Permission String |
| :--- | :--- |
| **Camera** | `android.permission.CAMERA` |
| **Storage** | `android.permission.WRITE_EXTERNAL_STORAGE` |
| **Location** | `android.permission.ACCESS_FINE_LOCATION` |
| **Internet** | `android.permission.INTERNET` (Enabled by default) |

---
[🏠 Back to Home](../)
