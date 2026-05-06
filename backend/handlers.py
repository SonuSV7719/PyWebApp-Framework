"""
Native Backend API.
These Python functions interface directly with the Host OS (Android/Windows/Linux)
to provide high-performance native capabilities to the frontend UI.
"""

import os
import platform
import sqlite3
import hashlib
import urllib.request
import urllib.error
import time
from typing import Any, Dict, List

from pywebapp.core import get_logger, register
from pywebapp.core.context import get_context

logger = get_logger("native_api")


# ─── 1. System Telemetry ─────────────────────────────────────────

@register(description="Get hardware and OS telemetry")
def get_device_telemetry() -> Dict[str, Any]:
    """
    Fetches real hardware and OS metrics natively.
    """
    logger.info("Fetching device telemetry...")
    
    # Calculate approximate memory using sys for cross-platform compatibility without psutil
    try:
        cpu_count = os.cpu_count() or 1
    except Exception:
        cpu_count = "Unknown"

    return {
        "os": platform.system(),
        "release": platform.release(),
        "architecture": platform.machine(),
        "python_version": platform.python_version(),
        "cpu_cores": cpu_count,
        "device_name": platform.node()
    }


# ─── 2. Local Database (SQLite) ──────────────────────────────────

def _get_db_path() -> str:
    """Helper to get a safe, writable path for the SQLite database on any OS."""
    context = get_context()
    # On Android, use the secure internal files directory. On desktop, use a local folder.
    data_dir = context.get("filesDir") or os.path.join(os.getcwd(), "local_data")
    os.makedirs(data_dir, exist_ok=True)
    return os.path.join(data_dir, "app_database.sqlite")

def get_db_connection():
    """Context-aware SQLite connection manager."""
    conn = sqlite3.connect(_get_db_path())
    conn.row_factory = sqlite3.Row
    # Ensure table exists immediately when connection is created
    with conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS user_activity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    return conn

@register(description="Fetch logs from the database")
def fetch_logs() -> List[Dict[str, Any]]:
    """Connects to a local SQLite database and fetches the latest logs."""
    logger.info(f"Accessing database at: {_get_db_path()}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # Fetch last 5 logs
        cursor.execute('SELECT id, action, timestamp FROM user_activity ORDER BY id DESC LIMIT 5')
        rows = cursor.fetchall()
        
    return [{"id": r["id"], "action": r["action"], "timestamp": r["timestamp"]} for r in rows]

@register(description="Insert a new activity log")
def add_log(action: str) -> Dict[str, Any]:
    """Inserts a real record into the SQLite database."""
    if not action or not action.strip():
        return {"success": False, "error": "Action cannot be empty"}
        
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO user_activity (action) VALUES (?)', (action.strip(),))
        conn.commit()
        
    logger.info(f"Saved log: {action}")
    return {"success": True, "message": "Record saved successfully"}


# ─── 3. File Cryptography ────────────────────────────────────────

@register(description="Calculate the SHA-256 hash of a local file natively")
def calculate_file_hash(file_path: str) -> Dict[str, Any]:
    """
    Reads a file chunk-by-chunk natively (bypassing RAM limits) 
    and calculates its cryptographic SHA-256 hash.
    """
    logger.info(f"Hashing file: {file_path}")
    
    # Strip 'file://' prefix if present from webviews
    if file_path.startswith("file://"):
        file_path = file_path[7:]
        
    if not os.path.exists(file_path):
        return {"success": False, "error": "File not found on device"}
        
    try:
        sha256_hash = hashlib.sha256()
        file_size = os.path.getsize(file_path)
        
        # Read in 4MB chunks to prevent out-of-memory errors on massive files
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096 * 1024), b""):
                sha256_hash.update(byte_block)
                
        return {
            "success": True,
            "hash": sha256_hash.hexdigest(),
            "size_mb": round(file_size / (1024 * 1024), 2)
        }
    except Exception as e:
        logger.error(f"Hashing failed: {e}")
        return {"success": False, "error": str(e)}


# ─── 4. Network Diagnostics ──────────────────────────────────────

@register(description="Perform a network latency test")
def ping_server(url: str = "https://1.1.1.1") -> Dict[str, Any]:
    """
    Uses Python's native urllib to perform a real HTTP GET request
    and measure the exact round-trip latency.
    """
    logger.info(f"Pinging {url}...")
    
    if not url.startswith("http"):
        url = "https://" + url

    start_time = time.time()
    try:
        # 3 second timeout
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=3.0) as response:
            status = response.status
        
        latency_ms = int((time.time() - start_time) * 1000)
        return {
            "success": True,
            "latency_ms": latency_ms,
            "status": status,
            "host": url
        }
    except urllib.error.URLError as e:
        return {"success": False, "error": f"Connection failed: {e.reason}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ─── 5. Native Permissions (Python-Driven) ───────────────────────

@register(description="Check Android permissions directly from Python")
def check_permission(permission: str) -> Dict[str, Any]:
    """
    Demonstrates using the internal Python permissions plugin.
    This plugin has dozens of mapped constants (CAMERA, LOCATION, SMS, etc).
    """
    logger.info(f"Checking permission natively: {permission}")
    try:
        from pywebapp.plugins import permissions
        status = permissions.get_status(permission)
        return {"success": True, "granted": status, "permission": permission}
    except Exception as e:
        return {"success": False, "error": str(e)}

@register(description="Request Android permissions directly from Python")
def request_permission_python(permission: str) -> Dict[str, Any]:
    """
    Triggers the native Android permission popup from Python.
    The thread will safely block until the user taps Allow or Deny.
    """
    logger.info(f"Requesting permission natively: {permission}")
    try:
        from pywebapp.plugins import permissions
        # Blocks until user responds, but doesn't freeze the UI because 
        # handlers run in an async threadpool!
        granted = permissions.request(permission)
        return {"success": True, "granted": granted, "permission": permission}
    except Exception as e:
        return {"success": False, "error": str(e)}
