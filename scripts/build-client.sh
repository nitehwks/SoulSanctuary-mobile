#!/bin/bash
# =============================================================================
# SoulSanctuary - Client Build Script
# =============================================================================
# Compiles the client code for all platforms:
#   - iOS     (.app + .ipa for simulator and device)
#   - Android (.apk + .aab)
#   - macOS   (.dmg + .app via Electron)
#   - Windows (.exe + .msi via Electron)
#
# Prerequisites:
#   - macOS with Xcode installed
#   - Android Studio with SDK and NDK
#   - Node.js 18+ and npm
#   - Homebrew
#
# Usage:
#   ./scripts/build-client.sh [platform] [environment]
#
# Platforms: all (default), ios, android, macos, windows, web
# Environment: development (default), production, staging
#
# Examples:
#   ./scripts/build-client.sh              # Build all platforms
#   ./scripts/build-client.sh ios          # iOS only
#   ./scripts/build-client.sh android prod # Android production
#   ./scripts/build-client.sh macos prod   # macOS production
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Configuration
SERVER_IP="216.39.74.180"
SERVER_PORT="3001"
BUILD_DIR="$PROJECT_ROOT/releases"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="$BUILD_DIR/$TIMESTAMP"

# Parse arguments
PLATFORM="${1:-all}"
ENV="${2:-production}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

log() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +%H:%M:%S)] ✅${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date +%H:%M:%S)] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +%H:%M:%S)] ❌${NC} $1"
}

log_section() {
    echo ""
    echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

log_platform() {
    echo ""
    echo -e "${MAGENTA}${BOLD}▶ $1${NC}"
    echo -e "${MAGENTA}${BOLD}──────────────────────────────────────────────────────────────${NC}"
}

# =============================================================================
# Validation
# =============================================================================

# Validate platform
case "$PLATFORM" in
    all|ios|android|macos|windows|web)
        ;;
    *)
        log_error "Invalid platform: $PLATFORM"
        echo "Usage: $0 [all|ios|android|macos|windows|web] [development|production|staging]"
        exit 1
        ;;
esac

# Validate environment
case "$ENV" in
    development|production|staging|dev|prod)
        ;;
    *)
        log_error "Invalid environment: $ENV"
        echo "Usage: $0 [platform] [development|production|staging]"
        exit 1
        ;;
esac

# Normalize environment names
if [ "$ENV" = "dev" ]; then ENV="development"; fi
if [ "$ENV" = "prod" ]; then ENV="production"; fi

# =============================================================================
# Pre-build Setup
# =============================================================================
log_section "PRE-BUILD SETUP"
log "Platform: $PLATFORM"
log "Environment: $ENV"
log "Server: http://$SERVER_IP:$SERVER_PORT"
log "Release directory: $RELEASE_DIR"

# Create release directory
mkdir -p "$RELEASE_DIR"
log_success "Release directory created"

# Check for .env.local
if [ ! -f ".env.local" ]; then
    log_warn ".env.local not found! Creating from template..."
    cat > ".env.local" << EOF
VITE_API_URL=http://$SERVER_IP:$SERVER_PORT
FRONTEND_URL=https://soulsanctuary.app
PORT=$SERVER_PORT
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,capacitor://localhost,ionic://localhost,https://localhost,https://soulsanctuary.app,https://www.soulsanctuary.app,app://localhost
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY
OPENROUTER_MODEL=anthropic/claude-sonnet-4
OPENROUTER_FALLBACK_MODEL=openai/gpt-4o-mini
EOF
    log_warn "Please edit .env.local with your real API keys before building for production!"
fi

# Ensure VITE_API_URL points to production server for non-dev builds
if [ "$ENV" = "production" ]; then
    log "Ensuring VITE_API_URL is set to production server ($SERVER_IP)..."
    if grep -q "^VITE_API_URL=" .env.local; then
        sed -i '' "s|^VITE_API_URL=.*|VITE_API_URL=http://$SERVER_IP:$SERVER_PORT|" .env.local
    else
        echo "VITE_API_URL=http://$SERVER_IP:$SERVER_PORT" >> .env.local
    fi
    log_success "VITE_API_URL updated to production server"
fi

# =============================================================================
# Build Web Assets (required for all platforms)
# =============================================================================
build_web() {
    log_platform "Building Web Assets"
    
    log "Installing dependencies..."
    npm install --legacy-peer-deps
    
    log "Building web app for $ENV..."
    if [ "$ENV" = "production" ]; then
        npm run build
    else
        npm run build
    fi
    
    # Copy web build to release dir
    cp -r dist "$RELEASE_DIR/web"
    
    log_success "Web build complete: $RELEASE_DIR/web"
}

# =============================================================================
# Build iOS
# =============================================================================
build_ios() {
    log_platform "Building iOS"
    
    # Check prerequisites
    if ! command -v xcodebuild &> /dev/null; then
        log_error "Xcode not found. Please install Xcode from the App Store."
        return 1
    fi
    
    if ! command -v pod &> /dev/null; then
        log_warn "CocoaPods not found. Installing..."
        sudo gem install cocoapods
    fi
    
    # Sync Capacitor
    log "Syncing Capacitor for iOS..."
    npx cap sync ios
    
    cd ios/App
    
    # Install pods
    log "Installing CocoaPods dependencies..."
    if [ ! -d "Pods" ] || [ "Podfile.lock" -nt "Pods" ]; then
        pod install --repo-update
    else
        pod install
    fi
    
    cd "$PROJECT_ROOT"
    
    # Build for iOS Simulator
    log "Building for iOS Simulator..."
    xcodebuild clean build \
        -workspace "ios/App/App.xcworkspace" \
        -scheme "App" \
        -configuration "$ENV" \
        -destination "platform=iOS Simulator,name=iPhone 16" \
        CODE_SIGNING_ALLOWED=NO \
        BUILD_DIR="$RELEASE_DIR/ios/build"
    
    # Copy simulator app
    SIM_APP=$(find "$RELEASE_DIR/ios/build" -name "App.app" -type d | head -1)
    if [ -n "$SIM_APP" ]; then
        cp -R "$SIM_APP" "$RELEASE_DIR/ios/SoulSanctuary-Simulator.app"
        log_success "iOS Simulator build: $RELEASE_DIR/ios/SoulSanctuary-Simulator.app"
    fi
    
    # Build for iOS Device (unsigned, for manual signing later)
    log "Building for iOS Device (unsigned)..."
    xcodebuild clean build \
        -workspace "ios/App/App.xcworkspace" \
        -scheme "App" \
        -configuration "$ENV" \
        -destination "generic/platform=iOS" \
        CODE_SIGNING_ALLOWED=NO \
        BUILD_DIR="$RELEASE_DIR/ios/build-device" \
        || log_warn "iOS device build failed (may need provisioning profile)"
    
    DEVICE_APP=$(find "$RELEASE_DIR/ios/build-device" -name "App.app" -type d | head -1)
    if [ -n "$DEVICE_APP" ]; then
        cp -R "$DEVICE_APP" "$RELEASE_DIR/ios/SoulSanctuary-Device.app"
        log_success "iOS Device build: $RELEASE_DIR/ios/SoulSanctuary-Device.app"
    fi
    
    log_success "iOS build complete"
}

# =============================================================================
# Build Android
# =============================================================================
build_android() {
    log_platform "Building Android"
    
    # Check prerequisites
    if [ ! -d "android" ]; then
        log_error "Android directory not found. Run 'npx cap add android' first."
        return 1
    fi
    
    # Sync Capacitor
    log "Syncing Capacitor for Android..."
    npx cap sync android
    
    cd android
    
    # Make gradlew executable
    chmod +x gradlew
    
    # Clean
    log "Cleaning Android build..."
    ./gradlew clean
    
    # Build debug APK
    log "Building Android Debug APK..."
    ./gradlew assembleDebug
    
    DEBUG_APK="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$DEBUG_APK" ]; then
        cp "$DEBUG_APK" "$RELEASE_DIR/android/SoulSanctuary-debug.apk"
        log_success "Debug APK: $RELEASE_DIR/android/SoulSanctuary-debug.apk"
    fi
    
    # Build release APK (requires signing config)
    if [ "$ENV" = "production" ]; then
        log "Building Android Release APK..."
        
        # Check if signing config exists
        if grep -q "storeFile" "app/build.gradle" 2>/dev/null || grep -q "releaseSigning" "app/build.gradle" 2>/dev/null; then
            ./gradlew assembleRelease
            
            RELEASE_APK="app/build/outputs/apk/release/app-release.apk"
            if [ -f "$RELEASE_APK" ]; then
                cp "$RELEASE_APK" "$RELEASE_DIR/android/SoulSanctuary-release.apk"
                log_success "Release APK: $RELEASE_DIR/android/SoulSanctuary-release.apk"
            fi
            
            # Build AAB for Google Play
            log "Building Android App Bundle (AAB)..."
            ./gradlew bundleRelease
            
            RELEASE_AAB="app/build/outputs/bundle/release/app-release.aab"
            if [ -f "$RELEASE_AAB" ]; then
                cp "$RELEASE_AAB" "$RELEASE_DIR/android/SoulSanctuary-release.aab"
                log_success "Release AAB: $RELEASE_DIR/android/SoulSanctuary-release.aab"
            fi
        else
            log_warn "No signing config found. Skipping release build."
            log_warn "To configure signing, add to android/app/build.gradle:"
            echo ""
            echo "  android {"
            echo "    signingConfigs {"
            echo "      release {"
            echo "        storeFile file('release.keystore')"
            echo "        storePassword 'YOUR_PASSWORD'"
            echo "        keyAlias 'soulsanctuary'"
            echo "        keyPassword 'YOUR_PASSWORD'"
            echo "      }"
            echo "    }"
            echo "    buildTypes {"
            echo "      release {"
            echo "        signingConfig signingConfigs.release"
            echo "      }"
            echo "    }"
            echo "  }"
            echo ""
        fi
    fi
    
    cd "$PROJECT_ROOT"
    log_success "Android build complete"
}

# =============================================================================
# Build macOS (via Electron)
# =============================================================================
build_macos() {
    log_platform "Building macOS (Electron)"
    
    # Check prerequisites
    if ! command -v brew &> /dev/null; then
        log_error "Homebrew not found. Please install Homebrew first."
        return 1
    fi
    
    # Setup Electron if not already done
    ELECTRON_DIR="$PROJECT_ROOT/electron"
    
    if [ ! -d "$ELECTRON_DIR" ]; then
        log "Setting up Electron for desktop builds..."
        
        # Create Electron app structure
        mkdir -p "$ELECTRON_DIR"
        cd "$ELECTRON_DIR"
        
        # Initialize npm project
        npm init -y
        
        # Install Electron and builder
        npm install electron@latest electron-builder@latest --save-dev
        
        # Create main.js
        cat > main.js << 'EOF'
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // Load the built web app
  win.loadFile(path.join(__dirname, '../dist/index.html'));
  
  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
EOF

        # Create preload.js
        cat > preload.js << 'EOF'
const { contextBridge } = require('electron');

// Expose safe APIs to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform
});
EOF

        # Create package.json for Electron
        cat > package.json << EOF
{
  "name": "soulsanctuary-desktop",
  "version": "2.0.0",
  "description": "SoulSanctuary Desktop App",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build:mac": "electron-builder --mac",
    "build:win": "electron-builder --win",
    "build:all": "electron-builder --mac --win"
  },
  "build": {
    "appId": "com.soulsanctuary.app",
    "productName": "SoulSanctuary",
    "directories": {
      "output": "../releases/electron"
    },
    "files": [
      "main.js",
      "preload.js",
      "assets/**/*",
      "../dist/**/*"
    ],
    "mac": {
      "category": "public.app-category.healthcare-fitness",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "zip",
          "arch": ["x64", "arm64"]
        }
      ],
      "icon": "assets/icon.icns"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "assets/icon.ico"
    }
  }
}
EOF

        # Create assets directory
        mkdir -p assets
        
        # Try to copy existing icon or create placeholder
        if [ -f "$PROJECT_ROOT/public/icon.png" ]; then
            cp "$PROJECT_ROOT/public/icon.png" assets/icon.png
        elif [ -f "$PROJECT_ROOT/public/favicon.ico" ]; then
            cp "$PROJECT_ROOT/public/favicon.ico" assets/icon.ico
        fi
        
        cd "$PROJECT_ROOT"
        log_success "Electron setup complete"
    fi
    
    # Build macOS app
    log "Building macOS app..."
    cd "$ELECTRON_DIR"
    
    # Ensure dist is up to date
    if [ ! -d "$PROJECT_ROOT/dist" ]; then
        log_warn "Web dist not found. Building web first..."
        cd "$PROJECT_ROOT"
        npm run build
        cd "$ELECTRON_DIR"
    fi
    
    # Build with electron-builder
    npx electron-builder --mac
    
    # Copy outputs to release dir
    ELECTRON_OUT="$PROJECT_ROOT/releases/electron"
    if [ -d "$ELECTRON_OUT" ]; then
        mkdir -p "$RELEASE_DIR/macos"
        find "$ELECTRON_OUT" -name "*.dmg" -exec cp {} "$RELEASE_DIR/macos/" \;
        find "$ELECTRON_OUT" -name "*.zip" -exec cp {} "$RELEASE_DIR/macos/" \;
        find "$ELECTRON_OUT" -name "*.app" -exec cp -R {} "$RELEASE_DIR/macos/" \;
    fi
    
    cd "$PROJECT_ROOT"
    log_success "macOS build complete"
}

# =============================================================================
# Build Windows (via Electron)
# =============================================================================
build_windows() {
    log_platform "Building Windows (Electron)"
    
    # Windows builds from macOS require wine and mono for electron-builder
    if ! command -v wine &> /dev/null; then
        log_warn "Wine not found. Installing for Windows cross-compilation..."
        brew install --cask wine-stable || log_warn "Wine install failed. Windows build may fail."
    fi
    
    if ! command -v mono &> /dev/null; then
        log_warn "Mono not found. Installing..."
        brew install mono || log_warn "Mono install failed. Windows build may fail."
    fi
    
    # Ensure Electron is set up
    ELECTRON_DIR="$PROJECT_ROOT/electron"
    if [ ! -d "$ELECTRON_DIR" ]; then
        log "Electron not set up yet. Running macOS build first to initialize..."
        build_macos
    fi
    
    # Build Windows app
    log "Building Windows installer and portable app..."
    cd "$ELECTRON_DIR"
    
    # Ensure dist is up to date
    if [ ! -d "$PROJECT_ROOT/dist" ]; then
        cd "$PROJECT_ROOT"
        npm run build
        cd "$ELECTRON_DIR"
    fi
    
    # Build with electron-builder
    npx electron-builder --win || log_warn "Windows build failed (Wine/Mono may be needed)"
    
    # Copy outputs to release dir
    ELECTRON_OUT="$PROJECT_ROOT/releases/electron"
    if [ -d "$ELECTRON_OUT" ]; then
        mkdir -p "$RELEASE_DIR/windows"
        find "$ELECTRON_OUT" -name "*.exe" -exec cp {} "$RELEASE_DIR/windows/" \;
        find "$ELECTRON_OUT" -name "*.msi" -exec cp {} "$RELEASE_DIR/windows/" \;
    fi
    
    cd "$PROJECT_ROOT"
    log_success "Windows build complete (or attempted)"
}

# =============================================================================
# Main Build Execution
# =============================================================================
log_section "SOULSANCTUARY CLIENT BUILD"
echo -e "  Platform:    ${BOLD}$PLATFORM${NC}"
echo -e "  Environment: ${BOLD}$ENV${NC}"
echo -e "  Server:      ${BOLD}http://$SERVER_IP:$SERVER_PORT${NC}"
echo -e "  Output:      ${BOLD}$RELEASE_DIR${NC}"
echo ""

# Build web assets first (required by all platforms)
if [ "$PLATFORM" != "web" ]; then
    build_web
fi

# Build requested platforms
case "$PLATFORM" in
    all)
        build_ios
        build_android
        build_macos
        build_windows
        ;;
    ios)
        build_ios
        ;;
    android)
        build_android
        ;;
    macos)
        build_macos
        ;;
    windows)
        build_windows
        ;;
    web)
        build_web
        ;;
esac

# =============================================================================
# Build Summary
# =============================================================================
log_section "BUILD SUMMARY"

log "Release directory: $RELEASE_DIR"
echo ""

# Count built artifacts
ARTIFACT_COUNT=0

if [ -d "$RELEASE_DIR/web" ]; then
    echo -e "${GREEN}✓ Web${NC}:       $RELEASE_DIR/web"
    ((ARTIFACT_COUNT++))
fi

if [ -d "$RELEASE_DIR/ios" ]; then
    echo -e "${GREEN}✓ iOS${NC}:       $RELEASE_DIR/ios"
    ls -1 "$RELEASE_DIR/ios" 2>/dev/null | while read f; do
        echo -e "         ${CYAN}$f${NC}"
    done
    ((ARTIFACT_COUNT++))
fi

if [ -d "$RELEASE_DIR/android" ]; then
    echo -e "${GREEN}✓ Android${NC}:   $RELEASE_DIR/android"
    ls -1 "$RELEASE_DIR/android" 2>/dev/null | while read f; do
        echo -e "         ${CYAN}$f${NC}"
    done
    ((ARTIFACT_COUNT++))
fi

if [ -d "$RELEASE_DIR/macos" ]; then
    echo -e "${GREEN}✓ macOS${NC}:     $RELEASE_DIR/macos"
    ls -1 "$RELEASE_DIR/macos" 2>/dev/null | while read f; do
        echo -e "         ${CYAN}$f${NC}"
    done
    ((ARTIFACT_COUNT++))
fi

if [ -d "$RELEASE_DIR/windows" ]; then
    echo -e "${GREEN}✓ Windows${NC}:   $RELEASE_DIR/windows"
    ls -1 "$RELEASE_DIR/windows" 2>/dev/null | while read f; do
        echo -e "         ${CYAN}$f${NC}"
    done
    ((ARTIFACT_COUNT++))
fi

echo ""
if [ "$ARTIFACT_COUNT" -gt 0 ]; then
    log_success "Build complete! $ARTIFACT_COUNT platform(s) built."
else
    log_warn "No artifacts were produced. Check the logs above."
fi

echo ""
echo -e "${CYAN}Next steps:${NC}"
if [ "$PLATFORM" = "all" ] || [ "$PLATFORM" = "ios" ]; then
    echo -e "  iOS:     ${CYAN}npx cap open ios${NC} to open in Xcode for signing"
fi
if [ "$PLATFORM" = "all" ] || [ "$PLATFORM" = "android" ]; then
    echo -e "  Android: ${CYAN}npx cap open android${NC} to open in Android Studio"
fi
if [ "$PLATFORM" = "all" ] || [ "$PLATFORM" = "macos" ]; then
    echo -e "  macOS:   Run ${CYAN}$RELEASE_DIR/macos/*.dmg${NC} to install"
fi
if [ "$PLATFORM" = "all" ] || [ "$PLATFORM" = "windows" ]; then
    echo -e "  Windows: Run ${CYAN}$RELEASE_DIR/windows/*.exe${NC} to install"
fi

echo ""
log "Done! 🎉"
