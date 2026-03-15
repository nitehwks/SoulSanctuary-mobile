# iOS App Setup Guide - Step by Step

## Overview

You have **TWO ways** to run the iOS app:

| Method | Use Case | Backend Connection | Live Reload |
|--------|----------|-------------------|-------------|
| **Dev Mode** | Active development | Connects to your computer's dev server | ✅ Yes |
| **Production Mode** | Testing final build | Uses built-in static files | ❌ No |

---

## Method 1: Dev Mode (Recommended for Development)

This connects your iPhone to your computer's dev server for live code reloading.

### Step 1: Get Your Computer's IP Address

```bash
# On Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or use this command
ipconfig getifaddr en0
```

You'll see something like: `192.168.1.42`

### Step 2: Configure Capacitor for Live Reload

Edit `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.soulsanctuary.app',
  appName: 'SoulSanctuary',
  webDir: 'dist',
  server: {
    // ENABLE THIS FOR DEV MODE:
    url: 'http://192.168.1.42:3000',  // <-- REPLACE with your IP
    cleartext: true,  // Allows HTTP (not HTTPS)
  },
  // ... rest of config
};
```

**⚠️ Important:** Replace `192.168.1.42` with YOUR computer's actual IP address.

### Step 3: Start the Dev Servers

**Terminal 1 - Backend Server:**
```bash
npm run server:dev
# This runs on port 3001
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
# This runs on port 3000
```

### Step 4: Sync Configuration to iOS

```bash
npx cap sync ios
```

### Step 5: Open in Xcode

```bash
npx cap open ios
```

### Step 6: Build and Run

1. In Xcode, select your **iPhone** (not simulator for Apple Sign In)
2. Click the **Play button** (▶) or press Cmd+R
3. The app will install and launch on your device

---

## Method 2: Production Mode (Static Build)

Use this to test the final build without live reload.

### Step 1: Disable Live Reload in Config

Edit `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.soulsanctuary.app',
  appName: 'SoulSanctuary',
  webDir: 'dist',
  // COMMENT OUT or REMOVE the server block:
  // server: {
  //   url: '...',
  //   cleartext: true,
  // },
};
```

### Step 2: Build and Sync

```bash
# Build the web app
npm run build

# Sync to iOS
npx cap sync ios
```

### Step 3: Configure API URL for Production

When using static build, the app needs to know where your backend is:

**Option A: Local Network (same WiFi)**
Edit `.env.local`:
```bash
VITE_API_URL=http://192.168.1.42:3001  # Your computer's IP + backend port
```

**Option B: Production URL**
```bash
VITE_API_URL=https://api.soulsanctuary.app
```

Then rebuild:
```bash
npm run build
npx cap sync ios
```

### Step 4: Open and Run in Xcode

```bash
npx cap open ios
```

Select your iPhone and click Play.

---

## Do You Need a Dev Server?

### Quick Answer:

| Scenario | Need Dev Server? | What to Run |
|----------|-----------------|-------------|
| Testing on iPhone with live reload | ✅ Yes | `npm run dev` + `npm run server:dev` |
| Testing static build locally | ✅ Yes (for backend API) | `npm run server:dev` |
| Using production API | ❌ No | Nothing |

### Detailed Explanation:

**The iOS app is NOT standalone** - it needs a backend server for:
- AI chat responses (OpenRouter API calls)
- Database operations (user data, moods, goals)
- Authentication verification

**You have two choices:**

1. **Run local dev servers** (your computer acts as the server)
   - Pros: Free, instant code changes with live reload
   - Cons: Computer must be on and on same WiFi as iPhone

2. **Deploy to production** (use a hosted backend)
   - Pros: Works anywhere, no computer needed
   - Cons: Requires deployment setup (Render, Railway, etc.)

---

## Quick Start Commands

### For Active Development:
```bash
# Terminal 1
npm run server:dev

# Terminal 2
npm run dev

# Terminal 3 - when you want to test on device
npm run watch:ios
```

### For Testing Final Build:
```bash
# One-time build
npm run rebuild:ios

# Then open Xcode and run
```

---

## Prerequisites Checklist

Before running on iOS, ensure you have:

- [ ] **Xcode installed** (Mac App Store or developer.apple.com)
- [ ] **Apple Developer Account** ($99/year) - REQUIRED for:
  - Running on physical device
  - Apple Sign In
  - Push notifications
- [ ] **iPhone with iOS 15+**
- [ ] **USB cable** to connect iPhone to Mac
- [ ] **Same WiFi network** (for dev mode)

---

## First-Time Setup in Xcode

### 1. Configure Signing

1. Open Xcode project: `npx cap open ios`
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Select your **Team** (Apple Developer account)
5. Xcode will auto-generate provisioning profile

### 2. Enable Capabilities

Add these capabilities (click + button):
- **Sign In with Apple** (for OAuth)
- **Push Notifications** (for alerts)
- **Background Modes** → Check "Remote notifications"

### 3. Trust Developer on iPhone

First time running:
1. App will install on iPhone
2. Go to **Settings → General → VPN & Device Management**
3. Tap your developer account
4. Tap **Trust**

---

## Troubleshooting

### "Cannot connect to server" error

**Cause:** iPhone can't reach your computer's dev server

**Fix:**
1. Ensure iPhone and Mac are on same WiFi
2. Check firewall settings (System Settings → Network → Firewall)
3. Use your computer's actual IP, not localhost
4. Try: `ping 192.168.1.42` from iPhone (using network utility app)

### Apple Sign In doesn't work

**Cause:** Apple Sign In requires real device + proper setup

**Fix:**
1. Must use physical iPhone (not simulator)
2. Enable "Sign In with Apple" capability in Xcode
3. Configure in Apple Developer Portal
4. Add redirect URLs to Clerk Dashboard

### App shows white screen

**Cause:** Frontend build issue or can't connect to backend

**Fix:**
```bash
# Clean and rebuild
rm -rf ios/App/App/public
rm -rf dist
npm run build
npx cap sync ios
npx cap open ios
```

### Build fails in Xcode

**Common fixes:**
```bash
# Update CocoaPods
cd ios/App && pod install --repo-update

# Clean build folder in Xcode
# Product → Clean Build Folder (Cmd+Shift+K)

# Reset Capacitor
npx cap sync ios --deployment
```

---

## Testing OAuth on iOS

### Google Sign In
- Works in both simulator and device
- Easiest to test first

### Apple Sign In
- **ONLY works on physical device**
- Requires Apple Developer account
- Must configure in Apple Developer Portal

To test Apple Sign In:
1. Build and run on physical iPhone
2. Tap Apple Sign In button
3. Should show native Apple authentication sheet
4. After auth, should redirect back to app

---

## Switching Between Dev and Production

### From Dev Mode → Production Mode:
1. Comment out `server.url` in `capacitor.config.ts`
2. Set `VITE_API_URL` to production backend
3. `npm run build && npx cap sync ios`
4. Build in Xcode

### From Production → Dev Mode:
1. Uncomment `server.url` with your IP
2. `npx cap sync ios`
3. Start dev servers (`npm run dev`)
4. Run in Xcode

---

## Need Help?

Check these logs:

**Xcode Console:**
- View → Debug Area → Activate Console
- Shows native iOS logs

**Safari Web Inspector:**
1. iPhone: Settings → Safari → Advanced → Web Inspector = ON
2. Mac Safari: Develop menu → Select your iPhone → SoulSanctuary
3. Shows JavaScript console from the app

**Backend Logs:**
- Watch the terminal running `npm run server:dev`
