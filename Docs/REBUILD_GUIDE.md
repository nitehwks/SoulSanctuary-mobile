# Complete Rebuild Guide for iOS

## Step 1: Stop Everything
```bash
# Kill all running processes
pkill -f "node\|vite\|tsx" || true

# Verify ports are free
lsof -ti:3000 && echo "Port 3000 in use" || echo "Port 3000 free"
lsof -ti:3001 && echo "Port 3001 in use" || echo "Port 3001 free"
```

## Step 2: Clean Build Artifacts
```bash
# Remove old builds
rm -rf dist
rm -rf ios/App/App/public
rm -rf ios/App/Pods
rm -rf ios/App/App.xcworkspace/xcuserdata

# Clear npm cache if needed
npm cache clean --force 2>/dev/null || true
```

## Step 3: Install Dependencies (if needed)
```bash
npm install
```

## Step 4: TypeScript Check
```bash
# Check for errors
npx tsc --noEmit
cd server && npx tsc --noEmit && cd ..
```

## Step 5: Build Web App
```bash
npm run build
```

## Step 6: Sync to iOS
```bash
npx cap sync ios
```

If you get CocoaPods errors:
```bash
cd ios/App && pod install --repo-update && cd ../..
```

## Step 7: Open in Xcode
```bash
npx cap open ios
```

---

## ONE COMMAND - Full Rebuild

Copy and paste this entire block:

```bash
# Stop everything
echo "🛑 Stopping all processes..."
pkill -f "node\|vite\|tsx" 2>/dev/null || true
sleep 2

# Clean
echo "🧹 Cleaning build artifacts..."
rm -rf dist ios/App/App/public

# Build
echo "🔨 Building web app..."
npm run build

# Sync
echo "📱 Syncing to iOS..."
npx cap sync ios

# Open Xcode
echo "🚀 Opening Xcode..."
npx cap open ios

echo "✅ Done! Select your iPhone and click Play in Xcode"
```

---

## Development Mode (Live Reload)

If you want live reload on your iPhone:

### Step 1: Edit capacitor.config.ts
```typescript
server: {
  url: 'http://YOUR_IP:3000',  // <-- Replace YOUR_IP
  cleartext: true,
},
```

Get your IP:
```bash
ipconfig getifaddr en0
```

### Step 2: Rebuild with Live Reload
```bash
# Clean and sync
rm -rf dist ios/App/App/public
npm run build
npx cap sync ios

# Open Xcode
npx cap open ios
```

### Step 3: Start Dev Servers (in separate terminals)

**Terminal 1:**
```bash
npm run server:dev
```

**Terminal 2:**
```bash
npm run dev
```

### Step 4: Run in Xcode
1. Select your iPhone
2. Click Play (▶)
3. The app will connect to your computer's dev server

---

## Production Mode (Static Build)

No live reload - app runs standalone:

### Step 1: Edit capacitor.config.ts
Comment out the server block:
```typescript
// server: {
//   url: '...',
//   cleartext: true,
// },
```

### Step 2: Set API URL
Edit `.env.local`:
```bash
# For local testing (same WiFi)
VITE_API_URL=http://YOUR_IP:3001

# OR for production
VITE_API_URL=https://your-api.com
```

### Step 3: Rebuild
```bash
rm -rf dist ios/App/App/public
npm run build
npx cap sync ios
npx cap open ios
```

---

## Troubleshooting Errors

### "Port already in use"
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### "Module not found"
```bash
rm -rf node_modules
npm install
```

### "CocoaPods error"
```bash
cd ios/App
pod deintegrate
pod install
 cd ../..
```

### "White screen on device"
```bash
# Clear everything
rm -rf dist ios/App/App/public ios/App/Pods ios/App/App.xcworkspace
npm run build
npx cap sync ios
cd ios/App && pod install && cd ../..
npx cap open ios
```

### "Build failed in Xcode"
1. Product → Clean Build Folder (Cmd+Shift+K)
2. Product → Build (Cmd+B)

---

## Quick Check After Rebuild

```bash
# 1. Verify build output exists
ls -la dist/index.html

# 2. Verify iOS has the files
ls -la ios/App/App/public/index.html

# 3. Check Capacitor config was copied
cat ios/App/App/capacitor.config.json
```

---

## Complete Fresh Start (Nuclear Option)

If nothing works, start completely fresh:

```bash
# 1. Kill everything
pkill -f "node\|vite\|tsx\|Xcode" || true

# 2. Delete everything
rm -rf dist
rm -rf node_modules
rm -rf ios/App/App/public
rm -rf ios/App/Pods
rm -rf ios/App/App.xcworkspace

# 3. Reinstall
npm install

# 4. Rebuild
npm run build

# 5. Recreate iOS
npx cap add ios 2>/dev/null || npx cap sync ios
cd ios/App && pod install && cd ../..

# 6. Open
npx cap open ios
```
