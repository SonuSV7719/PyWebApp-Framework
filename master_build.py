"""
PyWebApp Master Build Engine
The single entry point for all platforms (Android, Desktop, Linux).
Handles all dependencies, bundling, and compilation automatically.
"""
import os
import sys
import subprocess
import shutil

def check_and_install_deps():
    print("🔍 Checking environment dependencies...")
    
    # 1. Check Python Dependencies
    required_pip = ['pywebview', 'pyinstaller']
    for dep in required_pip:
        try:
            __import__(dep.replace('-', '_'))
        except ImportError:
            print(f"📦 Installing missing Python dependency: {dep}")
            subprocess.run([sys.executable, "-m", "pip", "install", dep], check=True)

    # 2. Check Node.js
    try:
        subprocess.run(['npm', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: Node.js/NPM not found. Please install Node.js to continue.")
        sys.exit(1)

def run_command(cmd, cwd=None, shell=True):
    """Run a command and show output."""
    print(f"🛠️ Executing: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    subprocess.run(cmd, cwd=cwd, shell=shell, check=True)

def build_frontend():
    print("\n📦 [1/3] Building Frontend (React + Vite)...")
    frontend_dir = os.path.join(os.getcwd(), 'frontend')
    run_command("npm install", cwd=frontend_dir)
    run_command("npm run build", cwd=frontend_dir)
    print("✅ Frontend built successfully.")

def build_linux():
    print("\n🐧 [2/3] Building Linux Desktop App (Standalone)...")
    if sys.platform == "win32":
        print("⚠️ Warning: You are on Windows. This will build a Windows EXE.")
        print("To build a native Linux binary, run this command on a Linux machine.")
    
    check_and_install_deps()
    build_frontend()
    
    dist_path = os.path.join(os.getcwd(), 'frontend', 'dist')
    # Use ':' for Linux/Mac and ';' for Windows
    separator = ":" if sys.platform != "win32" else ";"
    add_data = f"{dist_path}{separator}frontend/dist"
    
    cmd = [
        'pyinstaller', '--noconfirm', '--onefile', '--windowed',
        f'--add-data={add_data}', '--name=PyWebApp', 'scripts/run_desktop.py'
    ]
    run_command(cmd)
    print("\n✨ Linux/Desktop build complete! Check the 'dist/' folder.")

def build_android():
    print("\n📱 [3/3] Building Android App (APK)...")
    build_frontend()
    
    if sys.platform != "win32":
        # On Linux/Mac, use the shell script
        print("🐧 Detected Linux/Mac - Using optimized bash pipeline...")
        run_command("chmod +x scripts/build_android.sh")
        run_command("./scripts/build_android.sh")
    else:
        # On Windows, use the python script
        run_command([sys.executable, "scripts/build_android_release.py"])
    
    print("\n✨ Android build complete!")

def main():
    print("========================================")
    print("   PyWebApp Master Build Engine v1.1   ")
    print("========================================")
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python build.py --desktop  -> Build Desktop App (current OS)")
        print("  python build.py --linux    -> Build Linux Desktop App")
        print("  python build.py --android  -> Build Android APK")
        print("  python build.py --all      -> Build all platforms")
        return

    mode = sys.argv[1]
    
    try:
        if mode == '--desktop' or mode == '--linux':
            build_linux()
        elif mode == '--android':
            build_android()
        elif mode == '--all':
            build_linux()
            build_android()
        else:
            print(f"❓ Unknown mode: {mode}")
    except Exception as e:
        print(f"\n❌ Build failed: {e}")

if __name__ == "__main__":
    main()
