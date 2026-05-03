"""
PyWebApp CLI Tool
The heart of the PyWebApp framework.
Provides commands for development, building, and deployment.
"""
import os
import sys
import subprocess
import argparse

def run_command(cmd, cwd=None, shell=True):
    print(f"🛠️ Executing: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    subprocess.run(cmd, cwd=cwd, shell=shell, check=True)

def build_frontend():
    print("\n📦 Building Frontend...")
    frontend_dir = os.path.join(os.getcwd(), 'frontend')
    run_command("npm install", cwd=frontend_dir)
    run_command("npm run build", cwd=frontend_dir)

def init_project(name):
    print(f"\n🌟 Creating new PyWebApp project: {name}...")
    repo_url = "https://github.com/SonuSV7719/PyWebApp-Framework.git"
    try:
        subprocess.run(["git", "clone", repo_url, name], check=True)
        print(f"✅ Project '{name}' created successfully!")
        print(f"👉 To start: cd {name} && pywebapp dev")
    except Exception as e:
        print(f"❌ Failed to create project: {e}")

def dev_server():
    print("\n🚀 Launching Development Environment...")
    frontend_dir = os.path.join(os.getcwd(), 'frontend')
    # Start Vite in background (provides Hot Module Replacement)
    subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir, shell=True)
    
    # Give Vite a second to start
    import time
    time.sleep(2)
    
    # Launch the Desktop window in Dev Mode
    run_command([sys.executable, "scripts/run_desktop.py", "--dev"])

def main():
    parser = argparse.ArgumentParser(description="PyWebApp Framework CLI")
    parser.add_argument('command', choices=['init', 'dev', 'build-android', 'build-desktop', 'build-linux'], 
                        help='Command to execute')
    parser.add_argument('name', nargs='?', help='Project name for init command')
    
    args = parser.parse_args()

    try:
        if args.command == 'init':
            if not args.name:
                print("❌ Error: Please provide a project name. Usage: pywebapp init <name>")
                return
            init_project(args.name)
        elif args.command == 'dev':
            dev_server()
        elif args.command == 'build-android':
            build_frontend()
            if sys.platform == "win32":
                run_command([sys.executable, "scripts/build_android_release.py"])
            else:
                run_command("chmod +x scripts/build_android.sh && ./scripts/build_android.sh")
        elif args.command == 'build-desktop' or args.command == 'build-linux':
            build_frontend()
            # Logic from build.py...
            run_command([sys.executable, "scripts/build_desktop.py"])
        
        print(f"\n✨ {args.command.capitalize()} completed successfully!")
    except Exception as e:
        print(f"\n❌ Command failed: {e}")

if __name__ == "__main__":
    main()
