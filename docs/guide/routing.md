# 📱 Mobile Routing Best Practices

When building native apps with PyWebApp, how you handle navigation between "pages" determines how "native" your app feels. This guide covers the best strategies for high-performance mobile navigation.

## 🚀 The Gold Standard: SPA Routing
For the best user experience, you should use **Single Page Application (SPA) routing**. This means you have one `index.html` and use JavaScript to swap components.

### Recommended Tool: React Router
If you are using React, `react-router-dom` is the standard choice.

**Why use SPA Routing?**
1.  **Instant Transitions**: No page reloads. Transitions happen in milliseconds.
2.  **Shared State**: Your Python Bridge connection and global variables stay alive across all "pages."
3.  **Animations**: You can use libraries like `framer-motion` to add native-style slide or fade transitions between views.

### Example Setup (React)
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
```

---

## ⚠️ The "Classic" Way (Not Recommended for Mobile)
You can use multiple HTML files (e.g., `index.html` and `about.html`) and navigate using standard links: `<a href="about.html">`.

**The Drawbacks:**
*   **The "White Flash":** Every time you navigate, the WebView clears the screen and re-renders everything. This feels like a 2010 mobile website.
*   **Bridge Reset:** Depending on the platform, your Python Bridge might need to re-handshake, causing a slight delay in function calls.
*   **Performance:** Loading a new HTML file is significantly slower than swapping a React component.

---

## 💎 Elite Tip: Hardware Back Button (Android)
On Android, users expect the physical **Back Button** to go to the previous screen.

When using SPA Routing, the framework's Android host automatically detects the URL change in the WebView and maps the hardware back button to the browser history. **It just works!**

## Summary
*   **Always use SPA Routing** (React Router, Vue Router, etc.) for a premium native feel.
*   **Avoid physical `.html` file navigation** to prevent flickering.
*   **Use CSS Transitions** to make your "pages" slide in just like a real Android/iOS app.

---
© 2026 PyWebApp Native. Built for speed.
