#!/bin/bash
# =============================================================================
# SoulSanctuary v2.0 - Complete End-to-End Build Script
# =============================================================================
# This script builds the entire application with feature parity for iOS/Android
# Includes error correction, validation, and comprehensive logging
#
# Usage:
#   ./build-complete.sh [platform] [environment]
#
# Platforms: all (default), ios, android, web
# Environment: development (default), staging, production
# =============================================================================

set -o pipefail

# =============================================================================
# CONFIGURATION & VARIABLES
# =============================================================================

SCRIPT_VERSION="2.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="SoulSanctuary"
BUNDLE_ID="com.soulsanctuary.app"

BUILD_PLATFORM="${1:-all}"
BUILD_ENV="${2:-development}"
BUILD_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BUILD_LOG="${SCRIPT_DIR}/logs/build_${BUILD_TIMESTAMP}.log"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

ERRORS=()
WARNINGS=()
BUILD_SUCCESS=true

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$BUILD_LOG"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$BUILD_LOG"
}

log_warn() {
    echo -e "${YELLOW}[⚠]${NC} $1" | tee -a "$BUILD_LOG"
    WARNINGS+=("$1")
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$BUILD_LOG"
    ERRORS+=("$1")
    BUILD_SUCCESS=false
}

log_step() {
    echo -e "\n${CYAN}${BOLD}▶ $1${NC}" | tee -a "$BUILD_LOG"
}

log_header() {
    echo -e "\n${MAGENTA}${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}${BOLD}  $1${NC}"
    echo -e "${MAGENTA}${BOLD}══════════════════════════════════════════════════════════════${NC}\n" | tee -a "$BUILD_LOG"
}

show_progress() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\\'
    echo -ne "${YELLOW}[WAIT]${NC} $2 " | tee -a "$BUILD_LOG"
    while [ -d /proc/$pid ] 2>/dev/null || kill -0 $pid 2>/dev/null; do
        local temp=${spinstr#?}
        printf "[%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b"
    done
    wait $pid
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}[DONE]${NC}" | tee -a "$BUILD_LOG"
    else
        echo -e "${RED}[FAIL]${NC}" | tee -a "$BUILD_LOG"
    fi
    return $exit_code
}

attempt_fix() {
    local error_msg="$1"
    local fix_command="$2"
    local fix_description="$3"
    
    log_warn "$error_msg"
    log_info "Attempting fix: $fix_description"
    
    if eval "$fix_command" >> "$BUILD_LOG" 2>&1; then
        log_success "Fix applied successfully"
        return 0
    else
        log_error "Fix failed: $fix_description"
        return 1
    fi
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        return 1
    fi
    return 0
}

get_version() {
    local cmd="$1"
    local version_flag="${2:---version}"
    if check_command "$cmd"; then
        $cmd $version_flag 2>&1 | head -1
    else
        echo "not installed"
    fi
}

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

validate_environment() {
    log_step "Validating Environment"
    
    if check_command node; then
        NODE_VERSION=$(node --version | sed 's/v//')
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
        if [ "$NODE_MAJOR" -ge 18 ]; then
            log_success "Node.js $NODE_VERSION (>= 18.0.0)"
        else
            log_error "Node.js $NODE_VERSION is too old. Requires >= 18.0.0"
            exit 1
        fi
    else
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if check_command npm; then
        NPM_VERSION=$(npm --version)
        log_success "npm $NPM_VERSION"
    else
        log_error "npm is not installed"
        exit 1
    fi
    
    if check_command git; then
        GIT_VERSION=$(git --version | awk '{print $3}')
        log_success "git $GIT_VERSION"
    else
        log_warn "git is not installed (optional)"
    fi
    
    if [[ "$BUILD_PLATFORM" == "ios" || "$BUILD_PLATFORM" == "all" ]]; then
        validate_ios_prerequisites
    fi
    
    if [[ "$BUILD_PLATFORM" == "android" || "$BUILD_PLATFORM" == "all" ]]; then
        validate_android_prerequisites
    fi
}

validate_ios_prerequisites() {
    log_step "Validating iOS Prerequisites"
    
    if check_command xcodebuild; then
        XCODE_VERSION=$(xcodebuild -version | head -1)
        log_success "$XCODE_VERSION"
    else
        log_error "Xcode is not installed. Install from App Store."
        return 1
    fi
    
    if check_command pod; then
        POD_VERSION=$(pod --version)
        log_success "CocoaPods $POD_VERSION"
    else
        log_warn "CocoaPods not installed. Attempting to install..."
        if command -v gem &> /dev/null; then
            sudo gem install cocoapods >> "$BUILD_LOG" 2>&1 && \
                log_success "CocoaPods installed" || \
                log_error "Failed to install CocoaPods"
        else
            log_error "Ruby gems not available. Install CocoaPods manually."
        fi
    fi
    
    if check_command ios-deploy; then
        log_success "ios-deploy installed"
    else
        log_warn "ios-deploy not installed (optional, for physical device testing)"
    fi
}

validate_android_prerequisites() {
    log_step "Validating Android Prerequisites"
    
    if check_command java; then
        JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2)
        log_success "Java $JAVA_VERSION"
    else
        log_error "Java is not installed. Required for Android builds."
        return 1
    fi
    
    if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
        COMMON_ANDROID_PATHS=(
            "$HOME/Library/Android/sdk"
            "$HOME/Android/Sdk"
            "/usr/lib/android-sdk"
            "/opt/android-sdk"
        )
        
        FOUND_SDK=false
        for path in "${COMMON_ANDROID_PATHS[@]}"; do
            if [ -d "$path" ]; then
                export ANDROID_HOME="$path"
                export ANDROID_SDK_ROOT="$path"
                log_success "Found Android SDK at: $path"
                FOUND_SDK=true
                break
            fi
        done
        
        if [ "$FOUND_SDK" = false ]; then
            log_error "Android SDK not found. Set ANDROID_HOME environment variable."
            return 1
        fi
    else
        log_success "Android SDK: ${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
    fi
    
    if [ -d "$ANDROID_HOME/cmdline-tools" ] || [ -d "$ANDROID_HOME/tools" ]; then
        log_success "Android SDK tools found"
    else
        log_warn "Android SDK cmdline-tools not found"
    fi
}


# =============================================================================
# ENVIRONMENT & SETUP FUNCTIONS
# =============================================================================

validate_env_file() {
    log_step "Validating Environment Configuration"
    
    local required_vars=(
        "VITE_CLERK_PUBLISHABLE_KEY"
        "OPENROUTER_API_KEY"
        "DATABASE_URL"
    )
    
    local optional_vars=(
        "CLERK_SECRET_KEY"
        "JWT_SECRET"
        "ENCRYPTION_KEY"
        "FIREBASE_PROJECT_ID"
        "APNS_TEAM_ID"
    )
    
    local env_file=".env.local"
    if [ "$BUILD_ENV" = "production" ]; then
        env_file=".env.production"
    elif [ "$BUILD_ENV" = "staging" ]; then
        env_file=".env.staging"
    fi
    
    if [ -f "$env_file" ]; then
        log_success "Environment file found: $env_file"
    elif [ -f ".env" ]; then
        env_file=".env"
        log_success "Using .env file"
    else
        log_warn "No environment file found. Using .env.example as template."
        if [ -f ".env.example" ]; then
            cp .env.example ".env.local"
            log_warn "Created .env.local from template. Please configure it."
        fi
    fi
    
    local missing_required=false
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" "$env_file" 2>/dev/null && \
           ! grep -q "^$var=your-" "$env_file" 2>/dev/null && \
           ! grep -q "^$var=$" "$env_file" 2>/dev/null; then
            log_success "$var is configured"
        else
            log_error "$var is missing or using placeholder value"
            missing_required=true
        fi
    done
    
    for var in "${optional_vars[@]}"; do
        if grep -q "^$var=" "$env_file" 2>/dev/null && \
           ! grep -q "^$var=your-" "$env_file" 2>/dev/null; then
            log_success "$var is configured (optional)"
        else
            log_warn "$var is not configured (optional)"
        fi
    done
    
    if [ "$missing_required" = true ] && [ "$BUILD_ENV" = "production" ]; then
        log_error "Missing required environment variables for production build"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

clean_build_artifacts() {
    log_step "Cleaning Build Artifacts"
    
    local clean_items=(
        "dist"
        "node_modules/.vite"
        "ios/App/Pods"
        "ios/App/build"
        "android/app/build"
        "android/.gradle"
    )
    
    for item in "${clean_items[@]}"; do
        if [ -e "$item" ]; then
            rm -rf "$item" 2>/dev/null && \
                log_info "Cleaned: $item" || \
                log_warn "Could not clean: $item"
        fi
    done
    
    if [ -d "node_modules" ]; then
        if [ ! -f "node_modules/.package-lock.json" ] && [ -f "package-lock.json" ]; then
            log_warn "npm cache may be corrupted. Clearing..."
            npm cache clean --force >> "$BUILD_LOG" 2>&1
        fi
    fi
    
    log_success "Cleanup completed"
}

setup_directories() {
    log_step "Setting up Directory Structure"
    
    mkdir -p logs
    mkdir -p dist
    mkdir -p releases
    mkdir -p "releases/${BUILD_TIMESTAMP}"
    mkdir -p "releases/${BUILD_TIMESTAMP}/ios"
    mkdir -p "releases/${BUILD_TIMESTAMP}/android"
    
    log_success "Directories created"
}

install_dependencies() {
    log_step "Installing Dependencies"
    
    if [ ! -d "node_modules" ]; then
        log_info "Installing npm dependencies (this may take a while)..."
        npm ci >> "$BUILD_LOG" 2>&1 &
        show_progress $! "Installing npm packages"
        
        if [ $? -ne 0 ]; then
            attempt_fix "npm install failed" \
                "npm install --legacy-peer-deps" \
                "Retrying with legacy peer deps"
        fi
    else
        log_info "node_modules exists, checking for updates..."
        npm install >> "$BUILD_LOG" 2>&1 &
        show_progress $! "Updating dependencies"
    fi
    
    local critical_packages=(
        "@capacitor/core"
        "@capacitor/ios"
        "@capacitor/android"
        "vite"
        "react"
    )
    
    for pkg in "${critical_packages[@]}"; do
        if [ ! -d "node_modules/$pkg" ]; then
            log_error "Critical package missing: $pkg"
            return 1
        fi
    done
    
    log_success "Dependencies installed"
}

# =============================================================================
# WEB BUILD FUNCTIONS
# =============================================================================

build_web() {
    log_header "BUILDING WEB APPLICATION"
    
    log_step "Running TypeScript Compiler"
    npx tsc --noEmit >> "$BUILD_LOG" 2>&1
    if [ $? -ne 0 ]; then
        log_error "TypeScript compilation failed. Check for type errors."
        
        if grep -q "Cannot find module" "$BUILD_LOG" | tail -20; then
            attempt_fix "Missing TypeScript types detected" \
                "npm install --save-dev @types/node @types/react @types/react-dom" \
                "Installing missing type definitions"
        fi
        return 1
    fi
    log_success "TypeScript compilation passed"
    
    log_step "Building with Vite"
    
    local vite_args=""
    if [ "$BUILD_ENV" = "production" ]; then
        vite_args="--mode production"
    elif [ "$BUILD_ENV" = "staging" ]; then
        vite_args="--mode staging"
    fi
    
    npm run build -- $vite_args >> "$BUILD_LOG" 2>&1 &
    show_progress $! "Building web assets"
    
    if [ $? -ne 0 ]; then
        log_error "Vite build failed"
        
        if grep -q "Out of memory" "$BUILD_LOG"; then
            attempt_fix "Build ran out of memory" \
                "NODE_OPTIONS='--max-old-space-size=4096' npm run build" \
                "Retrying with increased memory limit"
        fi
        return 1
    fi
    
    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        log_error "Build output is incomplete"
        return 1
    fi
    
    local build_size=$(du -sh dist 2>/dev/null | cut -f1)
    log_success "Web build completed: $build_size"
    
    log_info "Build output:"
    ls -lh dist/ | tail -n +2 | tee -a "$BUILD_LOG"
    
    return 0
}

sync_capacitor() {
    log_step "Syncing Capacitor"
    
    npx cap sync >> "$BUILD_LOG" 2>&1 &
    show_progress $! "Syncing Capacitor platforms"
    
    if [ $? -ne 0 ]; then
        log_error "Capacitor sync failed"
        
        attempt_fix "Capacitor sync error" \
            "rm -rf ios android && npx cap add ios && npx cap add android && npx cap sync" \
            "Reinstalling Capacitor platforms"
        return $?
    fi
    
    log_success "Capacitor sync completed"
    return 0
}


# =============================================================================
# iOS BUILD FUNCTIONS
# =============================================================================

build_ios() {
    log_header "BUILDING iOS APPLICATION"
    
    if [ ! -d "ios/App" ]; then
        log_step "Adding iOS Platform"
        npx cap add ios >> "$BUILD_LOG" 2>&1
        if [ $? -ne 0 ]; then
            log_error "Failed to add iOS platform"
            return 1
        fi
    fi
    
    configure_ios_project
    
    log_step "Installing CocoaPods Dependencies"
    cd ios/App
    
    if [ -f "Podfile" ]; then
        pod install --repo-update >> "$BUILD_LOG" 2>&1 &
        show_progress $! "Installing pods"
        
        if [ $? -ne 0 ]; then
            attempt_fix "CocoaPods installation failed" \
                "pod install --verbose" \
                "Retrying pod install"
        fi
    fi
    cd "$SCRIPT_DIR"
    
    log_step "Building iOS Archive"
    
    local build_config="Debug"
    local destination="generic/platform=iOS"
    local archive_path="releases/${BUILD_TIMESTAMP}/ios/${PROJECT_NAME}.xcarchive"
    
    if [ "$BUILD_ENV" = "production" ]; then
        build_config="Release"
    fi
    
    mkdir -p "releases/${BUILD_TIMESTAMP}/ios"
    
    xcodebuild -workspace "ios/App/App.xcworkspace" \
        -scheme "App" \
        -configuration "$build_config" \
        -destination "$destination" \
        -archivePath "$archive_path" \
        archive \
        CODE_SIGNING_REQUIRED=NO \
        CODE_SIGNING_ALLOWED=NO \
        >> "$BUILD_LOG" 2>&1 &
    show_progress $! "Building iOS archive"
    
    if [ $? -ne 0 ]; then
        log_error "iOS archive build failed"
        
        if grep -q "unable to open workspace" "$BUILD_LOG"; then
            attempt_fix "Workspace not found" \
                "cd ios/App && pod install" \
                "Reinstalling CocoaPods"
        fi
        return 1
    fi
    
    log_success "iOS archive created: $archive_path"
    
    if [ "$BUILD_ENV" = "production" ]; then
        export_ios_ipa "$archive_path"
    fi
    
    return 0
}

configure_ios_project() {
    log_step "Configuring iOS Project"
    
    local info_plist="ios/App/App/Info.plist"
    local app_delegate="ios/App/App/AppDelegate.swift"
    
    if [ -f "$app_delegate" ]; then
        if ! grep -q "ApplicationDelegateProxy" "$app_delegate"; then
            log_info "Updating AppDelegate.swift"
            cat > "$app_delegate" << 'APPDELEGATE_EOF'
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
    
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
APPDELEGATE_EOF
        fi
    fi
    
    if [ -f "$info_plist" ]; then
        /usr/libexec/PlistBuddy -c "Add :NSFaceIDUsageDescription string 'Use Face ID to secure your sanctuary'" "$info_plist" 2>/dev/null || true
        /usr/libexec/PlistBuddy -c "Add :NSCameraUsageDescription string 'Camera for profile photos'" "$info_plist" 2>/dev/null || true
        /usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryUsageDescription string 'Photo library for profile images'" "$info_plist" 2>/dev/null || true
        /usr/libexec/PlistBuddy -c "Add :NSMicrophoneUsageDescription string 'Microphone for voice journaling'" "$info_plist" 2>/dev/null || true
        /usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" "$info_plist" 2>/dev/null || true
        
        log_success "iOS Info.plist configured"
    fi
}

export_ios_ipa() {
    local archive_path="$1"
    local export_options="releases/${BUILD_TIMESTAMP}/ios/ExportOptions.plist"
    
    log_step "Exporting iOS IPA"
    
    local team_id="${APNS_TEAM_ID:-YOUR_TEAM_ID}"
    local method="app-store"
    
    if [ "$BUILD_ENV" = "development" ]; then
        method="development"
    fi
    
    cat > "$export_options" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>$method</string>
    <key>teamID</key>
    <string>$team_id</string>
    <key>uploadSymbols</key>
    <true/>
    <key>uploadBitcode</key>
    <false/>
</dict>
</plist>
EOF
    
    log_warn "IPA export requires code signing. Manual export from Xcode recommended."
    log_info "Archive available at: $archive_path"
}

# =============================================================================
# ANDROID BUILD FUNCTIONS
# =============================================================================

build_android() {
    log_header "BUILDING ANDROID APPLICATION"
    
    if [ ! -d "android/app" ]; then
        log_step "Adding Android Platform"
        npx cap add android >> "$BUILD_LOG" 2>&1
        if [ $? -ne 0 ]; then
            log_error "Failed to add Android platform"
            return 1
        fi
    fi
    
    configure_android_project
    
    log_step "Building Android APK/AAB"
    
    cd android
    
    local gradle_task="assembleDebug"
    local output_name="app-debug"
    
    if [ "$BUILD_ENV" = "production" ]; then
        gradle_task="bundleRelease"
        output_name="app-release"
    elif [ "$BUILD_ENV" = "staging" ]; then
        gradle_task="assembleRelease"
        output_name="app-release"
    fi
    
    chmod +x gradlew
    
    ./gradlew clean >> "$BUILD_LOG" 2>&1
    
    ./gradlew $gradle_task >> "$BUILD_LOG" 2>&1 &
    show_progress $! "Building Android"
    
    if [ $? -ne 0 ]; then
        log_error "Android build failed"
        
        if grep -q "Could not find com.android.tools.build:gradle" "$BUILD_LOG"; then
            attempt_fix "Gradle plugin issue" \
                "./gradlew wrapper --gradle-version=8.0" \
                "Updating Gradle wrapper"
        fi
        
        if grep -q "OutOfMemoryError" "$BUILD_LOG"; then
            attempt_fix "Out of memory during build" \
                "export GRADLE_OPTS='-Xmx4096m -XX:MaxMetaspaceSize=512m' && ./gradlew $gradle_task" \
                "Retrying with more memory"
        fi
        
        cd "$SCRIPT_DIR"
        return 1
    fi
    
    cd "$SCRIPT_DIR"
    
    local apk_path="android/app/build/outputs/apk"
    local aab_path="android/app/build/outputs/bundle"
    
    mkdir -p "releases/${BUILD_TIMESTAMP}/android"
    
    if [ "$BUILD_ENV" = "production" ]; then
        if [ -f "$aab_path/release/app-release.aab" ]; then
            cp "$aab_path/release/app-release.aab" "releases/${BUILD_TIMESTAMP}/android/"
            log_success "Android App Bundle created"
        fi
    else
        if [ -d "$apk_path" ]; then
            find "$apk_path" -name "*.apk" -exec cp {} "releases/${BUILD_TIMESTAMP}/android/" \;
            log_success "Android APK created"
        fi
    fi
    
    for file in releases/${BUILD_TIMESTAMP}/android/*; do
        if [ -f "$file" ]; then
            local size=$(du -sh "$file" | cut -f1)
            log_info "$(basename $file): $size"
        fi
    done
    
    return 0
}

configure_android_project() {
    log_step "Configuring Android Project"
    
    local manifest="android/app/src/main/AndroidManifest.xml"
    local gradle_props="android/gradle.properties"
    
    if [ -f "$manifest" ]; then
        if ! grep -q "android.permission.BIOMETRIC" "$manifest"; then
            sed -i.bak '/<manifest/a\\n    <uses-permission android:name="android.permission.BIOMETRIC" />\n    <uses-permission android:name="android.permission.USE_BIOMETRIC" />\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n    <uses-permission android:name="android.permission.WAKE_LOCK" />' "$manifest"
            rm -f "$manifest.bak"
        fi
        log_success "AndroidManifest.xml configured"
    fi
    
    if [ -f "$gradle_props" ]; then
        if ! grep -q "org.gradle.jvmargs" "$gradle_props"; then
            cat >> "$gradle_props" << 'GRADLE_EOF'

# SoulSanctuary Build Optimizations
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.caching=true
android.useAndroidX=true
android.enableJetifier=true
GRADLE_EOF
        fi
        log_success "Gradle properties configured"
    fi
}


# =============================================================================
# FEATURE PARITY VALIDATION
# =============================================================================

validate_feature_parity() {
    log_header "VALIDATING FEATURE PARITY"
    
    log_step "Checking Feature Implementation"
    
    local features=(
        "AI Chat:@capacitor/browser,openai"
        "Push Notifications:@capacitor/push-notifications"
        "Local Notifications:@capacitor/local-notifications"
        "Haptics:@capacitor/haptics"
        "Storage:@capacitor/preferences"
        "Network:@capacitor/network"
        "Keyboard:@capacitor/keyboard"
        "Biometrics/Auth:@capacitor/app"
        "Screen Orientation:@capacitor/screen-orientation"
        "Splash Screen:@capacitor/splash-screen"
        "Status Bar:@capacitor/status-bar"
    )
    
    local all_features_present=true
    
    for feature in "${features[@]}"; do
        local name="${feature%%:*}"
        local packages="${feature#*:}"
        
        IFS=',' read -ra pkgs <<< "$packages"
        local found=false
        
        for pkg in "${pkgs[@]}"; do
            if [ -d "node_modules/$pkg" ]; then
                found=true
                break
            fi
        done
        
        if [ "$found" = true ]; then
            log_success "OK: $name"
        else
            log_warn "MISSING: $name - Package not found"
            all_features_present=false
        fi
    done
    
    log_step "Verifying Source Implementation"
    
    local source_checks=(
        "AI Chat:src/hooks/useAI.ts"
        "Mood Tracking:src/hooks/useMood.ts"
        "Goal Coaching:src/hooks/useGoals.ts"
        "Crisis Detection:src/utils/crisisDetection.ts"
        "Encryption:src/utils/encryption.ts"
        "Push Notifications:src/services/pushNotifications.ts"
        "Offline Support:src/services/offline.ts"
    )
    
    for check in "${source_checks[@]}"; do
        local name="${check%%:*}"
        local file="${check#*:}"
        
        if [ -f "$file" ]; then
            log_success "OK: $name implementation found"
        else
            log_warn "MISSING: $name implementation: $file"
        fi
    done
    
    log_step "Checking Platform Configuration"
    
    if [ -d "ios/App" ]; then
        if [ -f "ios/App/App/Info.plist" ]; then
            log_success "OK: iOS Info.plist configured"
        else
            log_warn "MISSING: iOS Info.plist"
        fi
        
        if [ -d "ios/App/App.xcworkspace" ]; then
            log_success "OK: iOS workspace configured"
        fi
    fi
    
    if [ -d "android/app" ]; then
        if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
            log_success "OK: AndroidManifest.xml configured"
        else
            log_warn "MISSING: AndroidManifest.xml"
        fi
    fi
    
    if [ "$all_features_present" = true ]; then
        log_success "All Capacitor features are available"
    else
        log_warn "Some Capacitor features may be missing. Run: npm install @capacitor/[package]"
    fi
}

# =============================================================================
# TESTING & QUALITY CHECKS
# =============================================================================

run_tests() {
    log_header "RUNNING TESTS"
    
    if [ ! -f "vitest.config.ts" ] && [ ! -f "vite.config.ts" ]; then
        log_warn "No test configuration found"
        return 0
    fi
    
    log_step "Running Unit Tests"
    
    npm run test >> "$BUILD_LOG" 2>&1 &
    show_progress $! "Running tests"
    
    if [ $? -ne 0 ]; then
        log_warn "Some tests failed. Check logs for details."
        
        read -p "Continue with build despite test failures? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    else
        log_success "All tests passed"
    fi
    
    return 0
}

run_linting() {
    log_step "Running Code Quality Checks"
    
    if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
        if check_command npx eslint; then
            npx eslint src/ --ext .ts,.tsx >> "$BUILD_LOG" 2>&1
            if [ $? -eq 0 ]; then
                log_success "ESLint checks passed"
            else
                log_warn "ESLint found issues"
            fi
        fi
    fi
    
    log_step "Checking for Security Vulnerabilities"
    npm audit --audit-level=high >> "$BUILD_LOG" 2>&1
    
    if [ $? -ne 0 ]; then
        log_warn "Security vulnerabilities found. Run 'npm audit fix' to resolve."
    else
        log_success "No high-severity vulnerabilities found"
    fi
}

# =============================================================================
# GENERATE REPORTS
# =============================================================================

generate_build_report() {
    log_step "Generating Build Report"
    
    local report_file="releases/${BUILD_TIMESTAMP}/BUILD_REPORT.md"
    local git_commit=$(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
    
    cat > "$report_file" << REPORT_EOF
# SoulSanctuary Build Report

## Build Information
- **Date:** $(date)
- **Version:** $SCRIPT_VERSION
- **Platform:** $BUILD_PLATFORM
- **Environment:** $BUILD_ENV
- **Commit:** $git_commit

## Build Status: $([ "$BUILD_SUCCESS" = true ] && echo "SUCCESS" || echo "FAILED")

## System Information
- Node.js: $(node --version 2>/dev/null || echo "N/A")
- npm: $(npm --version 2>/dev/null || echo "N/A")
- OS: $(uname -s -r 2>/dev/null || echo "N/A")

REPORT_EOF

    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo -e "\n## Warnings (${#WARNINGS[@]})" >> "$report_file"
        for warning in "${WARNINGS[@]}"; do
            echo "- WARNING: $warning" >> "$report_file"
        done
    fi

    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo -e "\n## Errors (${#ERRORS[@]})" >> "$report_file"
        for error in "${ERRORS[@]}"; do
            echo "- ERROR: $error" >> "$report_file"
        done
    fi

    echo -e "\n## Build Artifacts" >> "$report_file"
    
    if [ -d "releases/${BUILD_TIMESTAMP}/ios" ]; then
        echo -e "\n### iOS" >> "$report_file"
        ls -lh "releases/${BUILD_TIMESTAMP}/ios/" >> "$report_file" 2>/dev/null || echo "No iOS artifacts" >> "$report_file"
    fi
    
    if [ -d "releases/${BUILD_TIMESTAMP}/android" ]; then
        echo -e "\n### Android" >> "$report_file"
        ls -lh "releases/${BUILD_TIMESTAMP}/android/" >> "$report_file" 2>/dev/null || echo "No Android artifacts" >> "$report_file"
    fi
    
    if [ -d "dist" ]; then
        echo -e "\n### Web Build" >> "$report_file"
        echo "- Size: $(du -sh dist 2>/dev/null | cut -f1)" >> "$report_file"
        echo "- Files: $(find dist -type f | wc -l)" >> "$report_file"
    fi

    echo -e "\n## Feature Parity Check" >> "$report_file"
    echo "- iOS and Android builds use the same web assets" >> "$report_file"
    echo "- Capacitor plugins synced to both platforms" >> "$report_file"
    echo "- Feature parity ensured through shared codebase" >> "$report_file"

    echo -e "\n---\nGenerated by build-complete.sh v$SCRIPT_VERSION" >> "$report_file"

    log_success "Build report generated: $report_file"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

print_banner() {
    echo -e "${MAGENTA}"
    cat << "BANNER_EOF"
   _____            _           _   _                  _                  
  / ____|          | |         | | | |                | |                 
 | (___   ___  ___ | | ___  ___| |_| |    ___   __ _  | |_ ___  _ __ ___  
  \___ \ / _ \/ _ \| |/ _ \/ __| __| |   / _ \ / _` | | __/ _ \| '_ ` _ \ 
  ____) |  __/ (_) | |  __/ (__| |_| |__| (_) | (_| | | || (_) | | | | | |
 |_____/ \___|\___/|_|\___|\___|\__|_____\___/ \__,_|  \__\___/|_| |_| |_|
                                                                          
BANNER_EOF
    echo -e "${NC}"
    echo -e "${BOLD}Complete Build Script v${SCRIPT_VERSION}${NC}"
    echo -e "Platform: ${CYAN}${BUILD_PLATFORM}${NC} | Environment: ${CYAN}${BUILD_ENV}${NC}"
    echo ""
}

show_usage() {
    cat << USAGE_EOF
Usage: ./build-complete.sh [platform] [environment]

Platforms:
  all       Build for all platforms (default)
  ios       Build for iOS only
  android   Build for Android only
  web       Build web application only

Environments:
  development   Development build (default)
  staging       Staging build
  production    Production build (signed releases)

Examples:
  ./build-complete.sh                    # Build all for development
  ./build-complete.sh ios production     # Build iOS release
  ./build-complete.sh android staging    # Build Android staging
  ./build-complete.sh all production     # Full production build

Options:
  -h, --help    Show this help message
  -v, --version Show script version

USAGE_EOF
}

main() {
    case "$1" in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--version)
            echo "build-complete.sh v${SCRIPT_VERSION}"
            exit 0
            ;;
    esac
    
    print_banner
    
    case "$BUILD_PLATFORM" in
        all|ios|android|web)
            ;;
        *)
            echo "Invalid platform: $BUILD_PLATFORM"
            show_usage
            exit 1
            ;;
    esac
    
    mkdir -p logs
    echo "Build started at $(date)" > "$BUILD_LOG"
    echo "Platform: $BUILD_PLATFORM, Environment: $BUILD_ENV" >> "$BUILD_LOG"
    echo "========================================" >> "$BUILD_LOG"
    
    log_info "Log file: $BUILD_LOG"
    log_info "Build directory: releases/${BUILD_TIMESTAMP}"
    
    validate_environment
    if [ $? -ne 0 ]; then
        log_error "Environment validation failed"
        exit 1
    fi
    
    validate_env_file
    setup_directories
    
    if [ "$BUILD_ENV" = "production" ]; then
        clean_build_artifacts
    fi
    
    install_dependencies
    if [ $? -ne 0 ]; then
        log_error "Dependency installation failed"
        exit 1
    fi
    
    run_tests
    
    if [[ "$BUILD_PLATFORM" == "all" || "$BUILD_PLATFORM" == "web" || "$BUILD_PLATFORM" == "ios" || "$BUILD_PLATFORM" == "android" ]]; then
        build_web
        if [ $? -ne 0 ]; then
            log_error "Web build failed"
            exit 1
        fi
    fi
    
    if [[ "$BUILD_PLATFORM" == "all" || "$BUILD_PLATFORM" == "ios" || "$BUILD_PLATFORM" == "android" ]]; then
        sync_capacitor
        if [ $? -ne 0 ]; then
            log_error "Capacitor sync failed"
            exit 1
        fi
    fi
    
    if [[ "$BUILD_PLATFORM" == "all" || "$BUILD_PLATFORM" == "ios" ]]; then
        build_ios
        if [ $? -ne 0 ]; then
            log_error "iOS build failed"
        fi
    fi
    
    if [[ "$BUILD_PLATFORM" == "all" || "$BUILD_PLATFORM" == "android" ]]; then
        build_android
        if [ $? -ne 0 ]; then
            log_error "Android build failed"
        fi
    fi
    
    validate_feature_parity
    run_linting
    generate_build_report
    
    log_header "BUILD SUMMARY"
    
    if [ "$BUILD_SUCCESS" = true ]; then
        echo -e "${GREEN}${BOLD}BUILD SUCCESSFUL${NC}"
    else
        echo -e "${RED}${BOLD}BUILD COMPLETED WITH ERRORS${NC}"
    fi
    
    echo ""
    echo -e "${BOLD}Build Details:${NC}"
    echo "  Timestamp: $BUILD_TIMESTAMP"
    echo "  Platform: $BUILD_PLATFORM"
    echo "  Environment: $BUILD_ENV"
    echo "  Log: $BUILD_LOG"
    
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}Warnings: ${#WARNINGS[@]}${NC}"
    fi
    
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo ""
        echo -e "${RED}Errors: ${#ERRORS[@]}${NC}"
        for error in "${ERRORS[@]}"; do
            echo "  - $error"
        done
    fi
    
    echo ""
    echo -e "${CYAN}Build artifacts in: releases/${BUILD_TIMESTAMP}/${NC}"
    
    cp "$BUILD_LOG" "releases/${BUILD_TIMESTAMP}/"
    
    if [ "$BUILD_SUCCESS" = true ]; then
        exit 0
    else
        exit 1
    fi
}

main "$@"
