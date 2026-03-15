# SoulSanctuary Build Scripts

This directory contains build automation scripts for SoulSanctuary.

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run rebuild` | Rebuild web + all mobile platforms |
| `npm run rebuild:web` | Rebuild web only |
| `npm run rebuild:ios` | Rebuild web + iOS |
| `npm run rebuild:android` | Rebuild web + Android |
| `npm run watch` | Watch for changes and auto-rebuild all |
| `npm run watch:web` | Watch and rebuild web only |
| `npm run watch:ios` | Watch and rebuild web + iOS |
| `npm run watch:android` | Watch and rebuild web + Android |

---

## Scripts

### 1. `rebuild-all.sh` - One-time Rebuild

Rebuilds the specified platforms from scratch.

**Usage:**
```bash
# Rebuild everything (web, iOS, Android)
npm run rebuild

# Or directly:
./scripts/rebuild-all.sh all development
```

**Options:**
- `platform`: `all` (default), `web`, `ios`, `android`
- `environment`: `development` (default), `production`

**Examples:**
```bash
# Web only
npm run rebuild:web

# iOS development build
npm run rebuild:ios

# Android production build
./scripts/rebuild-all.sh android production

# Everything for production
./scripts/rebuild-all.sh all production
```

---

### 2. `watch-and-rebuild.js` - Auto-rebuild on Changes

Watches for file changes and automatically rebuilds the specified platforms.

**Usage:**
```bash
# Watch all platforms
npm run watch

# Watch specific platform
npm run watch:ios
```

**What it watches:**
- `src/` - Frontend React code
- `server/` - Backend API code

**What it ignores:**
- `node_modules/`
- `dist/`
- `ios/App/build/`, `ios/App/Pods/`
- `android/app/build/`, `android/.gradle/`
- Vite timestamp files
- Git directory

**Features:**
- Debounced rebuilds (500ms after last change)
- Queue system (if build is in progress, queues next build)
- Color-coded output
- Build timing

**Example Output:**
```
═══════════════════════════════════════════════════
  WATCH AND REBUILD
═══════════════════════════════════════════════════

Target: all
Watching directories: src, server
Press Ctrl+C to stop

✅ Watching src/
✅ Watching server/

═══════════════════════════════════════════════════
  STARTING BUILD
═══════════════════════════════════════════════════

[18:45:12] Building web app...
✅ Web build successful
[18:45:28] Syncing Capacitor platforms...
✅ Capacitor sync successful
[18:45:35] Building iOS app...
✅ iOS build successful

═══════════════════════════════════════════════════
  BUILD COMPLETE in 23.5s
═══════════════════════════════════════════════════
```

---

### 3. `dev-server.js` - Development Server

Runs the backend server with proper file watching (ignores Vite temp files).

**Usage:**
```bash
npm run server:dev
```

**Why this exists:**
The default `tsx watch` was restarting infinitely due to Vite's temporary files. This wrapper properly ignores those files.

---

### 4. `build-complete.sh` - Production Build

Comprehensive build script with error correction and validation.

**Usage:**
```bash
./build-complete.sh [platform] [environment]
```

See [BUILD_README.md](../BUILD_README.md) for full documentation.

---

## File Structure

```
scripts/
├── README.md              # This file
├── dev-server.js          # Development server with proper watching
├── rebuild-all.sh         # One-time rebuild script
├── watch-and-rebuild.js   # Auto-rebuild on file changes
└── build-helper.sh        # Quick build commands helper
```

---

## Workflow Examples

### Development Workflow

```bash
# Terminal 1: Start backend
npm run server:dev

# Terminal 2: Watch and auto-rebuild
npm run watch

# Make code changes...
# Script will automatically rebuild
```

### Pre-release Workflow

```bash
# Full production build
./scripts/rebuild-all.sh all production

# Or use the comprehensive build script
./build-complete.sh all production
```

### Mobile-only Workflow

```bash
# Just rebuild mobile platforms after web changes
npm run mobile:sync

# Or watch just iOS
npm run watch:ios
```

---

## Troubleshooting

### Build fails with "Out of memory"
```bash
export NODE_OPTIONS='--max-old-space-size=4096'
npm run rebuild
```

### iOS build fails with CocoaPods error
```bash
cd ios/App && pod deintegrate && pod install
cd ../..
npm run rebuild:ios
```

### Android build fails with Gradle error
```bash
cd android && ./gradlew clean
cd ..
npm run rebuild:android
```

### Watch script not detecting changes
Make sure you're editing files in `src/` or `server/` directories. The watch script ignores other directories to prevent infinite loops.

---

## Environment Variables

These scripts respect your `.env.local` file:
- `DATABASE_URL` - Database connection
- `OPENROUTER_API_KEY` - AI service
- `VITE_CLERK_PUBLISHABLE_KEY` - Authentication
- `ENCRYPTION_KEY` - Profile encryption
