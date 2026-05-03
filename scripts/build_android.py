#!/usr/bin/env python3
"""
Build script for the Android application.

Usage:
    python scripts/build_android.py              # Sync Python + build frontend + assemble APK
    python scripts/build_android.py --sync-only  # Only sync Python files to Android
    python scripts/build_android.py --skip-frontend  # Skip frontend rebuild

Steps:
    1. Syncs backend/*.py → android/app/src/main/python/ (with import rewrites)
    2. Builds frontend and copies to android/app/src/main/assets/web/
    3. Runs gradle assembleDebug
"""

import argparse
import os
import re
import shutil
import subprocess
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
ANDROID_PYTHON_DIR = os.path.join(
    PROJECT_ROOT, "android", "app", "src", "main", "python"
)
ANDROID_DIR = os.path.join(PROJECT_ROOT, "android")

# Files to sync from backend to Android
SYNC_FILES = ["api.py", "handlers.py", "logger.py", "context.py", "registry.py"]


def sync_python_files():
    """
    Copy backend Python files to Android's python source directory.
    Rewrites relative package imports to flat imports for Chaquopy compatibility.
    """
    print("\n📋 Syncing Python files to Android...")

    os.makedirs(ANDROID_PYTHON_DIR, exist_ok=True)

    for filename in SYNC_FILES:
        src = os.path.join(BACKEND_DIR, filename)
        dst = os.path.join(ANDROID_PYTHON_DIR, filename)

        if not os.path.exists(src):
            print(f"  ⚠️  Skipping {filename} — not found in backend/")
            continue

        with open(src, "r", encoding="utf-8") as f:
            content = f.read()

        # Rewrite relative imports for Chaquopy flat structure
        # `from .module import X` -> `from module import X`
        content = re.sub(r"from \.([a-zA-Z0-9_]+) import", r"from \1 import", content)
        
        # `from . import module` -> `import module`
        content = re.sub(r"from \. import ([a-zA-Z0-9_]+)", r"import \1", content)
        
        # `from . import module as alias` -> `import module as alias`
        content = re.sub(r"from \. import ([a-zA-Z0-9_]+ as [a-zA-Z0-9_]+)", r"import \1", content)

        # Add header comment
        header = f'"""\nAndroid-side copy of backend/{filename}\nAuto-synced by scripts/build_android.py — DO NOT EDIT DIRECTLY.\nSource of truth: backend/{filename}\n"""\n\n'

        # Only add header if not already present
        if "Auto-synced by scripts/build_android.py" not in content:
            content = header + content

        with open(dst, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"  ✅ {filename} → android/...python/{filename}")

    print("✅ Python files synced")


def build_frontend_for_android():
    """Build frontend and copy to Android assets."""
    build_script = os.path.join(PROJECT_ROOT, "scripts", "build_frontend.py")
    result = subprocess.run(
        [sys.executable, build_script, "--copy-to-android"],
        cwd=PROJECT_ROOT,
    )
    if result.returncode != 0:
        print("❌ Frontend build failed")
        sys.exit(1)


def build_apk():
    """Run Gradle assembleDebug."""
    print("\n🔨 Building Android APK...")

    gradle_cmd = "gradlew.bat" if sys.platform == "win32" else "./gradlew"
    gradle_path = os.path.join(ANDROID_DIR, gradle_cmd)

    if not os.path.exists(gradle_path):
        print(f"⚠️  Gradle wrapper not found at {gradle_path}")
        print("   Open the android/ folder in Android Studio to generate it,")
        print("   or run: cd android && gradle wrapper")
        return

    result = subprocess.run(
        [gradle_path, "assembleDebug"],
        cwd=ANDROID_DIR,
    )

    if result.returncode != 0:
        print("❌ Gradle build failed")
        sys.exit(result.returncode)

    apk_path = os.path.join(
        ANDROID_DIR, "app", "build", "outputs", "apk", "debug", "app-debug.apk"
    )
    if os.path.exists(apk_path):
        print(f"\n✅ APK built: {apk_path}")
    else:
        print("\n⚠️  APK not found at expected location")


def main():
    parser = argparse.ArgumentParser(description="Build Android application")
    parser.add_argument("--sync-only", action="store_true", help="Only sync Python files")
    parser.add_argument("--skip-frontend", action="store_true", help="Skip frontend build")
    args = parser.parse_args()

    # Always sync Python files
    sync_python_files()

    if args.sync_only:
        return

    # Build frontend
    if not args.skip_frontend:
        build_frontend_for_android()

    # Build APK
    build_apk()


if __name__ == "__main__":
    main()
