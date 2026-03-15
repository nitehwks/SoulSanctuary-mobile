# SoulSanctuary Build Quick Reference

## Common Commands

```bash
# Development Builds
./build-helper.sh quick           # Web only, fastest
./build-helper.sh ios-dev         # iOS debug build
./build-helper.sh android-dev     # Android debug APK
./build-helper.sh all-dev         # Everything, dev mode

# Production Builds
./build-helper.sh ios-prod        # iOS archive for App Store
./build-helper.sh android-prod    # Android AAB for Play Store
./build-helper.sh all-prod        # Full production build

# Utilities
./build-helper.sh clean           # Clean all build artifacts
./build-helper.sh setup           # Initial setup
./build-helper.sh sync            # Sync web to mobile
./build-helper.sh open-ios        # Open Xcode
./build-helper.sh open-android    # Open Android Studio
```

## Full Build Script Options

```bash
./build-complete.sh [platform] [environment]

# Platforms: all (default), ios, android, web
# Environments: development (default), staging, production

./build-complete.sh                    # Default: all platforms, dev
./build-complete.sh ios production     # iOS release
./build-complete.sh android staging    # Android staging
./build-complete.sh web development    # Web only
```

## Build Output Locations

```
releases/YYYYMMDD_HHMMSS/
├── ios/
│   └── SoulSanctuary.xcarchive      # iOS archive
├── android/
│   ├── app-debug.apk                # Debug APK
│   └── app-release.aab              # Play Store bundle
├── BUILD_REPORT.md                  # Build summary
└── build_YYYYMMDD_HHMMSS.log        # Detailed logs
```

## Prerequisites Checklist

### All Platforms
- [ ] Node.js >= 18
- [ ] npm >= 9
- [ ] `.env.local` configured

### iOS Only
- [ ] macOS
- [ ] Xcode installed
- [ ] CocoaPods (`sudo gem install cocoapods`)
- [ ] Apple Developer account

### Android Only
- [ ] Java JDK 11+
- [ ] Android SDK
- [ ] ANDROID_HOME set

## Environment Variables

```bash
# Required
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
OPENROUTER_API_KEY=sk-...
DATABASE_URL=postgresql://...

# Optional
APNS_TEAM_ID=XXXXXXXXXX
FIREBASE_PROJECT_ID=...
SENTRY_DSN=...
```

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Out of memory | `export NODE_OPTIONS='--max-old-space-size=4096'` |
| CocoaPods fail | `cd ios/App && pod deintegrate && pod install` |
| Android SDK not found | `export ANDROID_HOME=$HOME/Library/Android/sdk` |
| Clean start | `./build-helper.sh clean && ./build-helper.sh setup` |
| Reset everything | `rm -rf node_modules ios android && npm install && npx cap add ios && npx cap add android` |

## Build Time Estimates

| Platform | Development | Production |
|----------|-------------|------------|
| Web only | 30-60s | 60-120s |
| iOS only | 2-5min | 5-10min |
| Android only | 2-4min | 4-8min |
| All platforms | 5-10min | 10-20min |

*Times vary based on hardware and network speed*

## CI/CD One-Liner

```bash
./build-complete.sh all production 2>&1 | tee build.log && [ ${PIPESTATUS[0]} -eq 0 ] && echo "✅ SUCCESS" || echo "❌ FAILED"
```
