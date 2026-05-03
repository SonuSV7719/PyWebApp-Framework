"""
PyWebApp Desktop Builder
Compiles the project into a standalone executable.
Usage: python scripts/build_desktop.py
"""
import os
import subprocess
import shutil
import sys

def build_desktop():
    PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontend')
    DIST_DIR = os.path.join(FRONTEND_DIR, 'dist')
    
    print("🚀 Starting Desktop Build Pipeline...")

    # 1. Build Frontend
    print("📦 Building Frontend...")
    os.chdir(FRONTEND_DIR)
    subprocess.run(['npm', 'install'], check=True, shell=True)
    subprocess.run(['npm', 'run', 'build'], check=True, shell=True)

    # 2. Prepare PyInstaller Command
    print("📦 Packaging with PyInstaller...")
    os.chdir(PROJECT_ROOT)
    
    # We need to include the 'frontend/dist' folder as data
    # and also include our 'backend' package
    dist_data = f"{DIST_DIR}{os.pathsep}frontend/dist"
    backend_data = f"backend{os.pathsep}backend"
    
    pyinstaller_cmd = [
        'pyinstaller',
        '--noconfirm',
        '--onefile',
        '--windowed',
        f'--add-data={dist_data}',
        f'--add-data={backend_data}',
        '--name=PyWebApp',
        'scripts/run_desktop.py'
    ]

    try:
        subprocess.run(pyinstaller_cmd, check=True)
        print("\n✅ Desktop Build Successful!")
        print(f"👉 Executable available in: {os.path.join(PROJECT_ROOT, 'dist')}")
    except FileNotFoundError:
        print("\n❌ Error: PyInstaller not found. Please run: pip install pyinstaller pywebview")
    except Exception as e:
        print(f"\n❌ Build failed: {e}")

if __name__ == "__main__":
    build_desktop()
