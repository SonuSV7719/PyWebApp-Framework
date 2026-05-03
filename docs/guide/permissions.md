# 🔐 Mastering Android Permissions

To use native features like the Camera, GPS, or Storage, you need to handle permissions in two places.

## 1. The Manifest (The Declaration)
Open `android/app/src/main/AndroidManifest.xml` and add the permission you need:

```xml
<!-- Example: Adding GPS Permission -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## 2. The JavaScript Call (The Request)
In your React code, use the bridge to request the permission from the user at runtime:

```javascript
import { requestPermission } from './bridge';

const enableGPS = async () => {
  const granted = await requestPermission('android.permission.ACCESS_FINE_LOCATION');
  if (granted) {
    console.log("GPS is now active!");
  } else {
    alert("We need GPS to work!");
  }
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
