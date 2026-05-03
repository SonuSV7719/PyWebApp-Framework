"""
PyWebApp Desktop Runner
Allows running the same React/Python core as a Native Desktop App.
Requires: pip install pywebview
"""
import os
import webview
import json
from backend import api

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
    webview.start()

if __name__ == '__main__':
    main()
