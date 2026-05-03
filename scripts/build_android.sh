#!/bin/bash
# PyWebApp Linux Build Script
# Usage: ./scripts/build_android.sh

set -e

PROJECT_ROOT=$(pwd)
FRONTEND_DIR="$PROJECT_ROOT/frontend"
ANDROID_DIR="$PROJECT_ROOT/android"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🚀 Starting Linux Build Pipeline..."

# 1. Build Frontend
echo "📦 Building Frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build

# 2. Sync to Android Assets
echo "📱 Syncing Assets to Android..."
rm -rf "$ANDROID_DIR/app/src/main/assets/web"
mkdir -p "$ANDROID_DIR/app/src/main/assets/web"
cp -r "$FRONTEND_DIR/dist/"* "$ANDROID_DIR/app/src/main/assets/web/"

# 3. Sync Python Files
echo "🐍 Syncing Python Files..."
PYTHON_ASSETS="$ANDROID_DIR/app/src/main/assets/python"
mkdir -p "$PYTHON_ASSETS"
cp "$BACKEND_DIR/api.py" "$PYTHON_ASSETS/"
cp "$BACKEND_DIR/handlers.py" "$PYTHON_ASSETS/"
cp "$BACKEND_DIR/logger.py" "$PYTHON_ASSETS/"
cp "$BACKEND_DIR/context.py" "$PYTHON_ASSETS/"
cp "$BACKEND_DIR/registry.py" "$PYTHON_ASSETS/"

# 4. Build Android APK
echo "🔨 Building APK via Gradle..."
cd "$ANDROID_DIR"
chmod +x gradlew
./gradlew assembleDebug

echo "✅ Build Complete!"
echo "👉 APK: $ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
