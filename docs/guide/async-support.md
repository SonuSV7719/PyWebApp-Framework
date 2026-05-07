# ⚡ Asynchronous Support (v2.4.0)

PyWebApp-Native provides first-class support for **Asynchronous Python**. This is a critical feature for building responsive, high-concurrency applications that don't freeze while waiting for data.

---

## 🏗️ Why Use Async?

In a standard (synchronous) function, the Python interpreter is "blocked" until the function returns. In a cross-platform app, this can lead to:
- **UI Lag**: The bridge waits for Python to finish, potentially delaying other system signals.
- **Low Concurrency**: Only one request can be processed at a time.

**With `async def`**, the dispatcher can "pause" your function while it's waiting (e.g., for a database or network) and process other requests in the meantime.

---

## 🐍 Backend Implementation

Writing an async handler is as simple as adding the `async` keyword and using `await` for blocking operations.

### **1. Basic Async Handler**
```python
import asyncio
from pywebapp.core import register

@register(description="Wait then return")
async def wait_and_say_hi(name: str):
    # This DOES NOT block the app
    await asyncio.sleep(1.5) 
    return f"Hello {name}, sorry I'm late!"
```

### **2. Networking with `httpx` or `aiohttp`**
Use async libraries to fetch data without hanging the UI:
```python
import httpx
from pywebapp.core import register

@register(description="Fetch external data")
async def get_weather(city: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(f"https://api.weather.com/{city}")
        return r.json()
```

---

## ⚛️ Frontend Implementation

From the React perspective, **every call is already async**. The `pywebapp-bridge` returns a Promise regardless of whether your Python function is `def` or `async def`.

```javascript
import { call } from 'pywebapp-bridge';

const handleFetch = async () => {
    try {
        // The UI stays responsive while this waits!
        const response = await call('get_weather', ['New York']);
        
        if (response.success) {
            setWeather(response.result);
        }
    } catch (err) {
        console.error("IPC Error:", err);
    }
};
```

---

## 🔒 Concurrency & Safety

### **Locking Mechanism**
Even for `async` functions, the **Recursive Lock** in `v2.4.0` ensures that:
1. The **Pre-Middleware** and **Handler Discovery** are atomic.
2. Once the handler starts executing and hits an `await` point, the lock is **automatically released**.
3. This allows other IPC calls to enter the registry while your first call is suspended.

### **When to use Sync vs Async?**

| Scenario | Use `def` (Sync) | Use `async def` (Async) |
| :--- | :---: | :---: |
| **Simple Math** | ✅ Yes | ❌ Overkill |
| **Local File I/O** | ✅ Yes | 🟡 Optional |
| **Network API Calls** | ❌ No | ✅ Yes |
| **AI / Heavy ML** | ❌ No | ✅ Yes (with `to_thread`) |

---
[🏠 Back to Home](../)
