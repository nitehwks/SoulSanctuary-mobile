# Rebuild iOS with New API Key & IP Address

## Step 1: Stop Everything
```bash
pkill -f "node\|vite\|tsx" 2>/dev/null || true
sleep 2
```

## Step 2: Verify Your Changes
```bash
# Check IP is set
echo "Your IP:"
ipconfig getifaddr en0

# Check API key is set (first 20 chars)
echo "API Key:"
grep OPENROUTER_API_KEY .env.local | cut -c1-30

# Check capacitor config
cat capacitor.config.ts | grep -A3 "server:"
```

## Step 3: Full Rebuild
```bash
# Clean
rm -rf dist ios/App/App/public

# Build
npm run build

# Sync to iOS
npx cap sync ios

# Open Xcode
npx cap open ios
```

## Step 4: Start Dev Servers (2 Terminals)

**Terminal 1:**
```bash
npm run server:dev
```

**Terminal 2:**
```bash
npm run dev
```

## Step 5: Run in Xcode
1. Select your **iPhone**
2. Click **Play (▶)**
3. Test the chat!

---

## ONE COMMAND - Copy & Paste This:

```bash
pkill -f "node\|vite\|tsx" 2>/dev/null || true && sleep 2 && rm -rf dist ios/App/App/public && npm run build && npx cap sync ios && npx cap open ios
```

Then start the dev servers in separate terminals.
