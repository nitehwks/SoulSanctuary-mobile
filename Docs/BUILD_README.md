# SoulSanctuary Build System

A comprehensive, error-correcting build system for building SoulSanctuary across iOS, Android, and Web platforms with feature parity.

## Quick Start

```bash
# Make scripts executable
chmod +x build-complete.sh build-helper.sh

# Quick web build
./build-helper.sh quick

# Build everything for development
./build-helper.sh all-dev

# Build iOS production
./build-complete.sh ios production

# Build Android production
./build-complete.sh android production
```

## Scripts Overview

### `build-complete.sh` - Main Build Script

The comprehensive build script with error correction, validation, and comprehensive logging.

**Usage:**
```bash
./build-complete.sh [platform] [environment]
```

**Platforms:**
- `all` (default) - Build for iOS, Android, and Web
- `ios` - iOS only
- `android` - Android only
- `web` - Web application only

**Environments:**
- `development` (default) - Debug builds, unoptimized
- `staging` - Release builds with staging config
- `production` - Signed release builds, fully optimized

**Examples:**
```bash
./build-complete.sh                    # Build all platforms, dev mode
./build-complete.sh ios production     # iOS App Store build
./build-complete.sh android staging    # Android staging build
./build-complete.sh all production     # Full production build
```

### `build-helper.sh` - Quick Commands

Simplified interface for common build operations.

| Command | Description |
|---------|-------------|
| `quick`, `q` | Fast web development build |
| `ios-dev`, `id` | iOS development build |
| `ios-prod`, `ip` | iOS production build |
| `android-dev`, `ad` | Android development build |
| `android-prod`, `ap` | Android production build |
| `all-dev` | All platforms, development |
| `all-prod` | All platforms, production |
| `clean` | Clean all build artifacts |
| `setup` | Initial project setup |
| `sync` | Sync web build to mobile |
| `open-ios` | Open Xcode |
| `open-android` | Open Android Studio |
| `logs` | Show recent build logs |

## Build System Features

### ✅ Error Correction
- Automatic detection of common build failures
- Self-healing attempts (reinstall dependencies, clear caches)
- Smart retry logic with alternative approaches

### ✅ Validation & Checks
- Node.js version validation (>= 18 required)
- Xcode installation check (for iOS)
- Android SDK detection
- Environment variable validation
- Required vs optional configuration checks

### ✅ Feature Parity
Both iOS and Android builds:
- Use the exact same web assets (`dist/` folder)
- Sync all Capacitor plugins automatically
- Include the same feature implementations
- Pass identical feature parity checks

### ✅ Comprehensive Logging
- Timestamped logs for every build
- Color-coded output (info, success, warning, error)
- Build reports generated in Markdown
- Artifact tracking and sizing

### ✅ Build Artifacts
All builds are organized in `releases/[TIMESTAMP]/`:
```
releases/
└── 20260314_152656/
    ├── ios/
    │   └── SoulSanctuary.xcarchive
    ├── android/
    │   ├── app-debug.apk
    │   └── app-release.aab
    ├── BUILD_REPORT.md
    └── build_20260314_152656.log
```

## Platform-Specific Notes

### iOS Build Requirements
- macOS with Xcode installed
- CocoaPods (`sudo gem install cocoapods`)
- Apple Developer account (for device testing/App Store)
- Valid Team ID in environment variables

### Android Build Requirements
- Java JDK 11 or higher
- Android SDK (set ANDROID_HOME)
- Android Studio (optional but recommended)

### Environment Variables

Required for production builds:
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
OPENROUTER_API_KEY=sk-...
DATABASE_URL=postgresql://...
```

Optional:
```bash
APNS_TEAM_ID=XXXXXXXXXX          # For iOS signing
FIREBASE_PROJECT_ID=...          # For push notifications
SENTRY_DSN=...                   # For error tracking
```

## Troubleshooting

### Build fails with "Out of memory"
```bash
export NODE_OPTIONS='--max-old-space-size=4096'
./build-complete.sh all production
```

### CocoaPods issues
```bash
cd ios/App && pod deintegrate && pod install
cd ../..
./build-complete.sh ios
```

### Android SDK not found
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
./build-complete.sh android
```

### Clean everything and restart
```bash
./build-helper.sh clean
./build-helper.sh setup
./build-complete.sh all
```

## Build Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    BUILD PROCESS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. VALIDATION                                              │
│     ├── Check Node.js >= 18                                 │
│     ├── Check npm                                           │
│     ├── Validate iOS prerequisites (Xcode, CocoaPods)       │
│     └── Validate Android prerequisites (Java, SDK)          │
│                                                             │
│  2. ENVIRONMENT SETUP                                       │
│     ├── Validate .env files                                 │
│     ├── Check required variables                            │
│     └── Create release directories                          │
│                                                             │
│  3. DEPENDENCIES                                            │
│     ├── npm install (or npm ci)                             │
│     └── Verify critical packages                            │
│                                                             │
│  4. TESTING                                                 │
│     ├── TypeScript compilation                              │
│     ├── Unit tests (Vitest)                                 │
│     └── npm audit (security)                                │
│                                                             │
│  5. WEB BUILD                                               │
│     ├── Vite build                                          │
│     └── Generate dist/ folder                               │
│                                                             │
│  6. CAPACITOR SYNC                                          │
│     ├── npx cap sync (both platforms)                       │
│     └── Copy web assets to native projects                  │
│                                                             │
│  7. iOS BUILD                                               │
│     ├── Configure project settings                          │
│     ├── pod install                                         │
│     └── xcodebuild archive                                  │
│                                                             │
│  8. ANDROID BUILD                                           │
│     ├── Configure project settings                          │
│     └── ./gradlew assemble/bundle                           │
│                                                             │
│  9. VALIDATION                                              │
│     ├── Feature parity check                                │
│     ├── Artifact verification                               │
│     └── Generate build report                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Feature Parity Verification

The build script automatically verifies these features are available on both platforms:

| Feature | Package | iOS | Android |
|---------|---------|-----|---------|
| AI Chat | openai | ✅ | ✅ |
| Browser | @capacitor/browser | ✅ | ✅ |
| Push Notifications | @capacitor/push-notifications | ✅ | ✅ |
| Local Notifications | @capacitor/local-notifications | ✅ | ✅ |
| Haptics | @capacitor/haptics | ✅ | ✅ |
| Storage | @capacitor/preferences | ✅ | ✅ |
| Network | @capacitor/network | ✅ | ✅ |
| Keyboard | @capacitor/keyboard | ✅ | ✅ |
| Screen Orientation | @capacitor/screen-orientation | ✅ | ✅ |
| Splash Screen | @capacitor/splash-screen | ✅ | ✅ |
| Status Bar | @capacitor/status-bar | ✅ | ✅ |

## CI/CD Integration

For automated builds, use:

```bash
# Non-interactive mode (no prompts)
./build-complete.sh all production 2>&1 | tee build.log

# Exit code check
if [ $? -eq 0 ]; then
    echo "Build successful"
else
    echo "Build failed"
    exit 1
fi
```

## Support

- Build logs: `logs/build_*.log`
- Build reports: `releases/[TIMESTAMP]/BUILD_REPORT.md`
- Run `./build-helper.sh logs` to see recent logs
