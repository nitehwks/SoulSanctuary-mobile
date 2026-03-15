# SoulSanctuary Debug Guide

## Quick Start (Development)

### Terminal 1: Start the Backend Server
```bash
npm run server:dev
```
This starts the Express server on port 3001 with auto-restart on file changes.

### Terminal 2: Start the Frontend Dev Server
```bash
npm run dev
```
This starts Vite on port 3000 with proxy to backend.

### Access the App
Open: http://localhost:3000

---

## Testing Authentication

### 1. Test Backend Health
```bash
curl http://localhost:3001/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### 2. Test API Without Auth (should fail)
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","history":[],"mode":"general"}'
```
Expected: Should work (no auth required for /api/ai/chat)

### 3. Test API With Auth (should fail without token)
```bash
curl -X POST http://localhost:3001/api/ai/coach-response \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","history":[]}'
```
Expected: `{"error":"No token provided"}`

---

## OAuth Configuration Checklist

### Clerk Dashboard (https://dashboard.clerk.com)

1. **Social Connections Enabled:**
   - [ ] Apple Sign In
   - [ ] Google Sign In

2. **Redirect URLs Added:**
   ```
   http://localhost:3000/auth-callback
   soulsanctuary://auth-callback
   soulsanctuary://auth
   ```

3. **Apple Sign In Setup:**
   - Go to https://developer.apple.com
   - Create Services ID for "Sign In with Apple"
   - Add domain: `clerk.YOUR_DOMAIN.com`
   - Return URL: `https://clerk.YOUR_DOMAIN.com/v1/oauth_callback`

4. **Google Sign In Setup:**
   - Go to https://console.cloud.google.com
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://clerk.YOUR_DOMAIN.com/v1/oauth_callback`
     - `http://localhost:3000/auth-callback`

---

## Common Issues

### 1. "Chat not responding"

**Check browser console for:**
- 401 errors → Authentication issue
- 500 errors → Backend error
- Network errors → Backend not running

**Fix:**
```bash
# Make sure backend is running
npm run server:dev

# Check if AI service has API key
grep OPENROUTER_API_KEY .env.local
```

### 2. "OAuth buttons don't work"

**Check browser console for:**
- "redirect_url_not_allowed" → Add URL to Clerk Dashboard
- "OAuth provider not enabled" → Enable in Clerk Dashboard

### 3. "Cannot connect to backend"

**Verify:**
```bash
# Backend running on 3001
curl http://localhost:3001/health

# Frontend proxy working
curl http://localhost:3000/api/health
```

### 4. Database connection errors

**Check:**
```bash
# Database URL configured
grep DATABASE_URL .env.local

# Test connection
npm run db:studio
```

---

## Mobile Development

### iOS
```bash
# Build and sync
npm run rebuild:ios

# Or watch mode
npm run watch:ios
```

**Important:** Apple Sign In requires:
1. Real device (doesn't work in simulator)
2. Apple Developer account
3. Sign In with Apple capability enabled in Xcode

### Android
```bash
# Build and sync
npm run rebuild:android

# Or watch mode
npm run watch:android
```

---

## Environment Variables Check

Required in `.env.local`:
```bash
# AI
OPENROUTER_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://...

# Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# URL
FRONTEND_URL=http://localhost:3000

# Encryption
ENCRYPTION_KEY=...
```

---

## Debug Logging

### Frontend
Open browser DevTools → Console

### Backend
Watch terminal running `npm run server:dev`

### Enable verbose logging
```bash
DEBUG=* npm run server:dev
```
