"""
Business logic handlers.
Pure Python functions that implement the application's core functionality.
All functions are platform-independent and can be called from any native host.

Framework pattern: Use the @register decorator to expose functions via IPC.
No other changes needed — the dispatcher, bridge, and JS layer pick them up automatically.
"""

import os
import platform
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Union

from pywebapp.core import get_logger, register
from pywebapp.core.context import get_context

logger = get_logger("handlers")


# ─── Arithmetic ──────────────────────────────────────────────────

@register(description="Add two numbers")
def add(a: Union[int, float], b: Union[int, float]) -> Union[int, float]:
    """Add two numbers together."""
    logger.info(f"add({a}, {b})")
    return a + b

# ─── File Handling Example ───────────────────────────────────────

@register(description="Process a massive file and delete it to save space")
def process_file(file_path: str) -> Dict[str, Any]:
    """
    Example of handling gigabyte-sized files safely.
    It reads the file natively and immediately deletes it from 
    the Android cache to prevent running out of phone storage.
    """
    if not os.path.exists(file_path):
        return {"success": False, "error": "File not found"}
        
    try:
        # 1. Get file size natively (0ms latency, 0 RAM overhead)
        size_mb = os.path.getsize(file_path) / (1024 * 1024)
        logger.info(f"Processing file: {file_path} ({size_mb:.2f} MB)")
        
        # 2. (Insert your heavy ML or Video processing logic here)
        
        # 3. ALWAYS DELETE the file when done to save phone storage!
        os.remove(file_path)
        logger.info(f"Deleted temp file: {file_path}")
        
        return {
            "success": True, 
            "message": f"Successfully processed and deleted {size_mb:.2f} MB file!"
        }
    except Exception as e:
        logger.error(f"Error processing file: {e}")
        return {"success": False, "error": str(e)}


@register(description="Subtract two numbers")
def subtract(a: Union[int, float], b: Union[int, float]) -> Union[int, float]:
    """Subtract b from a."""
    logger.info(f"subtract({a}, {b})")
    result = a - b
    logger.debug(f"subtract result: {result}")
    return result


@register(description="Multiply two numbers")
def multiply(a: Union[int, float], b: Union[int, float]) -> Union[int, float]:
    """Multiply two numbers."""
    logger.info(f"multiply({a}, {b})")
    result = a * b
    logger.debug(f"multiply result: {result}")
    return result


# ─── Data Processing ─────────────────────────────────────────────

@register(description="Process and analyze text data")
def process_data(data: str) -> Dict[str, Any]:
    """
    Process a string of data and return analysis results.

    Args:
        data: Input string to process.

    Returns:
        Dictionary containing analysis results.
    """
    logger.info(f"process_data('{data[:50]}...')" if len(data) > 50 else f"process_data('{data}')")

    words = data.split()
    result = {
        "original": data,
        "uppercase": data.upper(),
        "word_count": len(words),
        "char_count": len(data.replace(" ", "")),
        "reversed": data[::-1],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    logger.debug(f"process_data result: word_count={result['word_count']}")
    return result


# ─── System ──────────────────────────────────────────────────────

@register(description="Get system/platform information")
def get_system_info() -> Dict[str, str]:
    """
    Gather and return system/platform information.
    Demonstrates that the same Python code runs on all platforms.
    """
    logger.info("get_system_info()")

    info = {
        "platform": platform.system(),
        "platform_release": platform.release(),
        "platform_version": platform.version(),
        "architecture": platform.machine(),
        "processor": platform.processor() or "N/A",
        "python_version": platform.python_version(),
        "hostname": platform.node(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    logger.debug(f"get_system_info result: {info['platform']} {info['python_version']}")
    return info


# ─── Sequences ───────────────────────────────────────────────────

@register(description="Generate Fibonacci sequence")
def fibonacci(n: int) -> List[int]:
    """
    Generate Fibonacci sequence up to n terms.

    Args:
        n: Number of Fibonacci terms to generate (max 100).

    Raises:
        ValueError: If n is negative or exceeds 100.
    """
    logger.info(f"fibonacci({n})")

    if not isinstance(n, int) or n < 0:
        raise ValueError("n must be a non-negative integer")
    if n > 100:
        raise ValueError("n must not exceed 100 to prevent memory issues")

    if n == 0:
        return []
    if n == 1:
        return [0]

    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])

    logger.debug(f"fibonacci result: {len(seq)} terms")
    return seq


# ─── Long-running Tasks ─────────────────────────────────────────

@register(description="Simulate a long-running task")
def async_heavy_task(duration_seconds: float = 2.0) -> Dict[str, Any]:
    """
    Simulate a long-running task (e.g., ML inference, file processing).

    Args:
        duration_seconds: How long to simulate work (max 10 seconds).
    """
    logger.info(f"async_heavy_task(duration={duration_seconds})")

    duration_seconds = min(float(duration_seconds), 10.0)
    start = time.time()

    # Simulate work
    time.sleep(duration_seconds)

    elapsed = time.time() - start
    result = {
        "status": "completed",
        "requested_duration": duration_seconds,
        "actual_duration": round(elapsed, 3),
        "message": f"Heavy task finished in {elapsed:.3f}s",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    logger.info(f"async_heavy_task completed in {elapsed:.3f}s")
    return result


# ─── File Processing ─────────────────────────────────────────────

@register(description="Perform file operations in Android storage")
def process_file_demo(filename: str, content: str) -> Dict[str, Any]:
    """
    Demonstrate file I/O on Android.
    1. Writes content to a file in the app's filesDir.
    2. Reads it back.
    3. Returns metadata.
    """
    logger.info(f"process_file_demo(filename='{filename}')")

    context = get_context()
    files_dir = context.get("filesDir")

    if not files_dir:
        # Fallback for local testing (not on Android)
        files_dir = os.path.join(os.getcwd(), "temp_storage")
        os.makedirs(files_dir, exist_ok=True)

    file_path = os.path.join(files_dir, filename)

    # 1. Write
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    # 2. Read back and get stats
    size = os.path.getsize(file_path)
    with open(file_path, "r", encoding="utf-8") as f:
        read_content = f.read()

    result = {
        "path": file_path,
        "size_bytes": size,
        "content_read": read_content,
        "success": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    logger.info(f"File processed successfully: {file_path} ({size} bytes)")
    return result
