#!/bin/bash
# =============================================================================
# SoulSanctuary Build Helper - Quick commands for common build scenarios
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$1" in
    quick|q)
        echo "🚀 Quick build (web only, development)..."
        ./build-complete.sh web development
        ;;
    ios-dev|id)
        echo "🍎 Building iOS development..."
        ./build-complete.sh ios development
        ;;
    ios-prod|ip)
        echo "🍎 Building iOS production..."
        ./build-complete.sh ios production
        ;;
    android-dev|ad)
        echo "🤖 Building Android development..."
        ./build-complete.sh android development
        ;;
    android-prod|ap)
        echo "🤖 Building Android production..."
        ./build-complete.sh android production
        ;;
    all-dev)
        echo "🔨 Building all platforms (development)..."
        ./build-complete.sh all development
        ;;
    all-prod)
        echo "📦 Building all platforms (production)..."
        ./build-complete.sh all production
        ;;
    clean)
        echo "🧹 Cleaning build artifacts..."
        rm -rf dist node_modules/.vite ios/App/Pods ios/App/build android/app/build android/.gradle
        echo "✅ Cleaned!"
        ;;
    setup)
        echo "⚙️  Initial project setup..."
        npm install
        npx cap add ios 2>/dev/null || echo "iOS platform already exists"
        npx cap add android 2>/dev/null || echo "Android platform already exists"
        echo "✅ Setup complete!"
        ;;
    sync)
        echo "🔄 Syncing Capacitor..."
        npm run build && npx cap sync
        ;;
    open-ios)
        echo "📱 Opening Xcode..."
        npx cap open ios
        ;;
    open-android)
        echo "📱 Opening Android Studio..."
        npx cap open android
        ;;
    logs)
        echo "📋 Recent build logs:"
        ls -lt logs/ 2>/dev/null | head -10 || echo "No logs found"
        ;;
    help|-h|--help|*)
        cat << 'EOF'
╔════════════════════════════════════════════════════════════════════╗
║           SoulSanctuary Build Helper Commands                      ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  QUICK COMMANDS:                                                   ║
║    quick, q         Quick web build (development)                  ║
║    ios-dev, id      Build iOS development                          ║
║    ios-prod, ip     Build iOS production                           ║
║    android-dev, ad  Build Android development                      ║
║    android-prod, ap Build Android production                       ║
║    all-dev          Build all platforms (development)              ║
║    all-prod         Build all platforms (production)               ║
║                                                                    ║
║  UTILITY COMMANDS:                                                 ║
║    clean            Clean all build artifacts                      ║
║    setup            Initial project setup                          ║
║    sync             Sync web build to mobile platforms             ║
║    open-ios         Open iOS project in Xcode                      ║
║    open-android     Open Android project in Android Studio         ║
║    logs             Show recent build logs                         ║
║                                                                    ║
║  FULL BUILD SCRIPT:                                                ║
║    ./build-complete.sh [platform] [environment]                    ║
║                                                                    ║
║    Platforms: all, ios, android, web                               ║
║    Environments: development, staging, production                  ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

Examples:
  ./build-helper.sh quick          # Fast web dev build
  ./build-helper.sh ios-dev        # iOS dev build
  ./build-helper.sh all-prod       # Full production build
  ./build-complete.sh ios production  # Direct script access

EOF
        ;;
esac
