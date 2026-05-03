# Tutorial: Building a Counter App

This walkthrough will show you how to build a simple "Increment/Decrement" Counter app from scratch using the PyWebApp framework. We will create the Python backend logic and connect it to a React frontend.

## 1. Setup the Backend

First, we need to create the backend logic that will manage the counter's state and provide functions to modify it.

Create a new file or add to your existing `backend/handlers.py`:

```python
from backend.registry import register

# A simple global variable to store our state. 
# In a real app, this might be a database or a class property.
current_count = 0

@register(description="Get the current count value", namespace="counter")
def get_count() -> int:
    """Returns the current counter value."""
    global current_count
    return current_count

@register(description="Increment the counter", namespace="counter")
def increment(amount: int = 1) -> int:
    """Increases the counter by the given amount."""
    global current_count
    current_count += amount
    return current_count

@register(description="Decrement the counter", namespace="counter")
def decrement(amount: int = 1) -> int:
    """Decreases the counter by the given amount."""
    global current_count
    current_count -= amount
    return current_count

@register(description="Reset the counter", namespace="counter")
def reset() -> int:
    """Resets the counter to zero."""
    global current_count
    current_count = 0
    return current_count
```

By using `@register(namespace="counter")`, these functions are now exposed to the frontend as `counter.get_count`, `counter.increment`, etc.

## 2. Setup the Frontend (React)

Now, let's build the UI in React to interact with these backend functions. 

Open your `frontend/src/App.jsx` and replace its contents with the following:

```jsx
import { useState, useEffect } from 'react';
import { call, isBridgeReady } from './bridge';
import './App.css';

function CounterApp() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the initial count when the component mounts
  useEffect(() => {
    const loadCount = async () => {
      // Wait for the bridge to be ready (especially important on Android)
      if (!isBridgeReady()) {
         // In a real app, you might wait for an event or retry
         console.warn("Bridge not ready yet...");
      }
      
      const response = await call('counter.get_count');
      if (response.success) {
        setCount(response.result);
      } else {
        setError(response.error);
      }
      setLoading(false);
    };

    loadCount();
  }, []);

  // Helper function to handle counter operations
  const handleOperation = async (operation, args = []) => {
    setError(null);
    const response = await call(`counter.${operation}`, args);
    
    if (response.success) {
      setCount(response.result);
    } else {
      setError(response.error);
    }
  };

  if (loading) return <div className="loading">Loading counter...</div>;

  return (
    <div className="counter-container">
      <h1>Simple Counter</h1>
      
      <div className="display">
        <h2>{count}</h2>
      </div>

      <div className="controls">
        <button onClick={() => handleOperation('decrement', [1])}>-1</button>
        <button onClick={() => handleOperation('increment', [1])}>+1</button>
      </div>
      
      <div className="controls secondary">
        <button onClick={() => handleOperation('decrement', [5])}>-5</button>
        <button onClick={() => handleOperation('increment', [5])}>+5</button>
      </div>

      <button className="reset" onClick={() => handleOperation('reset')}>
        Reset
      </button>

      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default CounterApp;
```

## 3. Add Some Styling

Add these basic styles to `frontend/src/App.css`:

```css
.counter-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(30, 30, 40, 0.8);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
  color: white;
}

.display h2 {
  font-size: 4rem;
  margin: 1rem 0;
  color: #646cff;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

button {
  padding: 0.8rem 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  background: #2a2a35;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #3a3a45;
}

.secondary button {
  background: #1f1f25;
  font-size: 1rem;
}

button.reset {
  margin-top: 1rem;
  background: #ff4646;
  width: 100%;
}

button.reset:hover {
  background: #ff5e5e;
}

.error {
  margin-top: 1rem;
  color: #ff4646;
  font-size: 0.9rem;
}
```

## 4. Run the App

### Desktop
1. Ensure the frontend is built: `cd frontend && npm run build` (or run `npm run dev` for hot reload).
2. Start the desktop app: `cd desktop && python main.py` (or `python main.py --dev` for hot reload).

### Android
1. Build the frontend and sync Python files: `python scripts/build_android.py`
2. Open the `android/` directory in Android Studio.
3. Click the **Run** button to launch the app on an emulator or connected device.
   *(For hot reload on Android, see the [Hot Reload](/guide/hot-reload) guide).*

You now have a fully functional cross-platform counter app! The state is managed entirely in Python, and the UI is rendered by React, communicating seamlessly via IPC.
