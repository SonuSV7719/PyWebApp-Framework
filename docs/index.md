---
layout: home

hero:
  name: PyWebApp
  text: Cross-Platform Apps with React + Python
  tagline: Build desktop & mobile apps using a React WebView frontend and Python backend — connected via IPC, not HTTP.
  actions:
    - theme: brand
      text: Get Started →
      link: /guide/getting-started
    - theme: alt
      text: View Architecture
      link: /guide/architecture

features:
  - icon: ⚡
    title: Zero HTTP Servers
    details: Pure IPC communication. No FastAPI, no localhost, no port conflicts. In-process calls on desktop, JavascriptInterface on Android.
  - icon: 🧩
    title: One-Line Extension
    details: Add @register() above any Python function and it's instantly callable from JavaScript. No bridge code changes needed.
  - icon: 🔥
    title: Hot Reload Everything
    details: Frontend HMR via Vite + Python module hot reload via watchdog (desktop) and ADB sync (Android). Edit and see changes instantly.
  - icon: 🐍
    title: Pure Python Backend
    details: Write business logic once in Python. It runs identically on Windows, macOS, Linux, and Android via Chaquopy.
  - icon: 📱
    title: True Cross-Platform
    details: Windows, macOS, Linux (pywebview) and Android (Kotlin + Chaquopy). Same codebase, same IPC contract.
  - icon: 🔌
    title: Middleware & Plugins
    details: Pre/post-call hooks, namespace grouping, and schema introspection make it easy to build production-grade plugin architectures.
---
