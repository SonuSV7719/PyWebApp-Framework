"""
PyWebApp Desktop Runner
Allows running the same React/Python core as a Native Desktop App.
Requires: pip install pywebview
"""
import os
import sys
import webview
import json

# 🏛️ PATH FIX: Ensure we can find the 'backend' folder
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    from backend import api
    print("✅ Backend logic connected.")
except ImportError as e:
    print(f"❌ Critical Error: Could not load backend. {e}")
    sys.exit(1)

class DesktopBridge:
    def dispatch(self, method, params_json):
        params = json.loads(params_json) if params_json else []
        result = api.dispatch(method, params)
        return json.dumps(result)

    def showToast(self, message):
        print(f"[TOAST]: {message}")

    def shareText(self, text):
        print(f"[SHARE]: {text}")

def main():
    # Detect if we should use the Dev Server (Hot Reload) or static files
    is_dev = "--dev" in sys.argv
    
    if is_dev:
        url = "http://localhost:5173"
        print(f"🔥 Hot-Reload Mode Active: Connecting to {url}")
    else:
        # Path to the frontend build
        frontend_dist = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
        index_html = os.path.join(frontend_dist, 'index.html')
        if not os.path.exists(index_html):
            print("❌ Error: Frontend build not found. Please run 'pywebapp build-desktop' first.")
            return
        url = f'file://{index_html}'

    bridge = DesktopBridge()
    
    print("🚀 Launching PyWebApp Desktop...")
    window = webview.create_window(
        'PyWebApp Desktop', 
        url=url,
        js_api=bridge,
        width=1200,
        height=800
    )
    
    # Start the app
    webview.start(debug=is_dev)

if __name__ == '__main__':
    main()
