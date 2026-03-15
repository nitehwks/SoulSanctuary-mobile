#!/bin/bash
# =============================================================================
# SoulSanctuary - iOS Build Fix Script
# Fixes common Capacitor iOS build issues
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
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

cd "$(dirname "$0")/.."

log_section "iOS BUILD FIX"

# Step 1: Clean DerivedData
log "${YELLOW}Step 1: Cleaning Xcode DerivedData...${NC}"
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
rm -rf ~/Library/Developer/Xcode/DerivedData/ModuleCache
log "${GREEN}✅ Cleaned DerivedData${NC}"

# Step 2: Clean iOS build artifacts
log "${YELLOW}Step 2: Cleaning iOS build artifacts...${NC}"
cd ios/App
rm -rf build/
rm -rf DerivedData/
rm -rf .build/
cd ../..
log "${GREEN}✅ Cleaned iOS build${NC}"

# Step 3: Clean and reinstall node_modules
log "${YELLOW}Step 3: Reinstalling node modules...${NC}"
rm -rf node_modules/@capacitor/keyboard
npm install @capacitor/keyboard --save
log "${GREEN}✅ Reinstalled keyboard plugin${NC}"

# Step 4: Clean Pods
log "${YELLOW}Step 4: Cleaning CocoaPods...${NC}"
cd ios/App
rm -rf Pods/
rm -rf Podfile.lock
rm -rf ~/Library/Caches/CocoaPods
rm -rf ~/.cocoapods/repos
log "${GREEN}✅ Cleaned Pods${NC}"

# Step 5: Sync Capacitor
log "${YELLOW}Step 5: Syncing Capacitor...${NC}"
cd ../..
npx cap sync ios
log "${GREEN}✅ Capacitor sync complete${NC}"

# Step 6: Setup Pods
log "${YELLOW}Step 6: Installing Pods...${NC}"
cd ios/App
pod setup --verbose
pod install --verbose
log "${GREEN}✅ Pods installed${NC}"

# Step 7: Fix Keyboard plugin header issue
log "${YELLOW}Step 7: Fixing Keyboard plugin headers...${NC}"

# Find the Keyboard.h file and fix it
KEYBOARD_HEADER="Pods/CapacitorKeyboard/Sources/KeyboardPlugin/include/Keyboard.h"
if [ -f "$KEYBOARD_HEADER" ]; then
    # Backup original
    cp "$KEYBOARD_HEADER" "$KEYBOARD_HEADER.backup"
    
    # Fix the import statement
    sed -i '' 's/#import "Capacitor\/CAPPlugin.h"/#import <Capacitor\/CAPPlugin.h>/g' "$KEYBOARD_HEADER"
    
    log "${GREEN}✅ Fixed Keyboard.h import${NC}"
else
    log "${YELLOW}⚠️  Keyboard.h not found at expected path${NC}"
fi

# Step 8: Update build settings
log "${YELLOW}Step 8: Updating build settings...${NC}"

# Add to Podfile post_install hook if not present
PODFILE="Podfile"
if [ -f "$PODFILE" ]; then
    # Check if we need to add the post_install hook
    if ! grep -q "fix_double_quote_imports" "$PODFILE"; then
        cat >> "$PODFILE" << 'EOF'

# Fix for Capacitor plugin header issues
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'NO'
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      config.build_settings['DEFINES_MODULE'] = 'YES'
      config.build_settings['SWIFT_VERSION'] = '5.0'
    end
  end
end
EOF
        log "${GREEN}✅ Updated Podfile with build settings${NC}"
    fi
    
    # Reinstall pods with new settings
    pod install
fi

cd ../..

log_section "iOS BUILD FIX COMPLETE"
echo ""
echo -e "${GREEN}Try building now:${NC}"
echo -e "  ${CYAN}npm run rebuild:ios${NC}"
echo ""
echo -e "${YELLOW}If it still fails, try:${NC}"
echo -e "  1. Open Xcode: ${CYAN}npx cap open ios${NC}"
echo -e "  2. Clean build folder: Cmd+Shift+K"
echo -e "  3. Build: Cmd+B"
echo ""
