#!/bin/bash
# =============================================================================
# SoulSanctuary - Rebuild All Platforms
# =============================================================================
# This script rebuilds the web app and syncs to all mobile platforms
#
# Usage:
#   ./scripts/rebuild-all.sh [platform] [environment]
#
# Platforms: all (default), web, ios, android
# Environment: development (default), production
#
# Examples:
#   ./scripts/rebuild-all.sh              # Rebuild everything
#   ./scripts/rebuild-all.sh web          # Web only
#   ./scripts/rebuild-all.sh ios prod     # iOS production
#   ./scripts/rebuild-all.sh android dev  # Android development
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

PLATFORM="${1:-all}"
ENV="${2:-development}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

log() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Parse platform flags
BUILD_WEB=false
BUILD_IOS=false
BUILD_ANDROID=false

case "$PLATFORM" in
    web)
        BUILD_WEB=true
        ;;
    ios)
        BUILD_WEB=true
        BUILD_IOS=true
        ;;
    android)
        BUILD_WEB=true
        BUILD_ANDROID=true
        ;;
    all)
        BUILD_WEB=true
        BUILD_IOS=true
        BUILD_ANDROID=true
        ;;
    *)
        echo "Invalid platform: $PLATFORM"
        echo "Usage: $0 [all|web|ios|android] [development|production]"
        exit 1
        ;;
esac

log_section "REBUILD: $PLATFORM ($ENV)"

# Step 1: Build Web
if [ "$BUILD_WEB" = true ]; then
    log "${YELLOW}Building web app...${NC}"
    
    if [ "$ENV" = "production" ]; then
        npm run build
    else
        # For dev, we just build normally
        npm run build
    fi
    
    log "${GREEN}✅ Web build complete${NC}"
fi

# Step 2: Sync Capacitor (needed for mobile)
if [ "$BUILD_IOS" = true ] || [ "$BUILD_ANDROID" = true ]; then
    log "${YELLOW}Syncing Capacitor...${NC}"
    npx cap sync
    log "${GREEN}✅ Capacitor sync complete${NC}"
fi

# Step 3: Build iOS
if [ "$BUILD_IOS" = true ]; then
    log_section "Building iOS"
    
    cd ios/App
    
    # Install pods if needed
    if [ ! -d "Pods" ] || [ "Podfile.lock" -nt "Pods" ]; then
        log "${YELLOW}Installing CocoaPods...${NC}"
        pod install --repo-update
    fi
    
    cd ../..
    
    # Build with xcodebuild
    log "${YELLOW}Building iOS app...${NC}"
    xcodebuild -workspace "ios/App/App.xcworkspace" \
        -scheme "App" \
        -configuration "${ENV}" \
        -destination "generic/platform=iOS" \
        clean build
    
    log "${GREEN}✅ iOS build complete${NC}"
fi

# Step 4: Build Android
if [ "$BUILD_ANDROID" = true ]; then
    log_section "Building Android"
    
    cd android
    
    # Clean and build
    log "${YELLOW}Building Android app...${NC}"
    ./gradlew clean
    
    if [ "$ENV" = "production" ]; then
        ./gradlew assembleRelease
    else
        ./gradlew assembleDebug
    fi
    
    cd ..
    
    log "${GREEN}✅ Android build complete${NC}"
fi

log_section "REBUILD COMPLETE"
echo -e "Platform: ${BOLD}$PLATFORM${NC}"
echo -e "Environment: ${BOLD}$ENV${NC}"
echo ""

if [ "$BUILD_IOS" = true ]; then
    echo -e "${CYAN}Open iOS in Xcode:${NC} npx cap open ios"
fi

if [ "$BUILD_ANDROID" = true ]; then
    echo -e "${CYAN}Open Android in Android Studio:${NC} npx cap open android"
fi

echo ""
