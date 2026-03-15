# OAuth Setup for SoulSanctuary

## Clerk Dashboard Configuration

### 1. Go to Clerk Dashboard
Visit: https://dashboard.clerk.com

### 2. Navigate to Authentication → Social Connections
Enable these providers:
- ✅ Apple
- ✅ Google
- ✅ Phone Number (already working)

### 3. Redirect URLs Configuration

Go to **Settings → URL & Paths**

Add these **Allowed Redirect URLs**:

```
# Web (Development)
http://localhost:5173/auth-callback

# Web (Production)
https://soulsanctuary.app/auth-callback
https://your-domain.com/auth-callback

# iOS/Android (Capacitor)
soulsanctuary://auth-callback
soulsanctuary://auth

# Universal Links (iOS)
https://soulsanctuary.app/auth-callback
```

### 4. OAuth Provider Settings

#### Apple Sign In
1. Go to [Apple Developer](https://developer.apple.com)
2. Create Services ID for "Sign In with Apple"
3. Add domain: `clerk.your-domain.com`
4. Configure return URL: `https://clerk.your-domain.com/v1/oauth_callback`
5. Copy the Services ID to Clerk Dashboard

#### Google Sign In
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://clerk.your-domain.com/v1/oauth_callback`
   - `https://your-domain.com/auth-callback`
4. Copy Client ID and Secret to Clerk Dashboard

---

## Mobile OAuth Deep Links

### iOS Setup

1. Open Xcode project:
   ```bash
   npx cap open ios
   ```

2. In **Info.plist**, add URL scheme (already configured):
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLName</key>
       <string>com.soulsanctuary.app</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>com.soulsanctuary.app</string>
       </array>
     </dict>
   </array>
   ```

3. Enable **Sign In with Apple** capability in Xcode

### Android Setup

1. Open Android Studio:
   ```bash
   npx cap open android
   ```

2. Verify `AndroidManifest.xml` has intent filter (already in capacitor.config.ts)

---

## Testing OAuth

### Web
1. Run `npm run dev`
2. Click Apple or Google sign-in buttons
3. Should redirect to provider, then back to app

### iOS Simulator
1. Run `npm run watch:ios` or rebuild
2. Note: Apple Sign In requires real device (doesn't work in simulator)
3. Google Sign In should work in simulator

### Android Emulator
1. Run `npm run rebuild:android`
2. Both Apple and Google should work

---

## Troubleshooting

### "redirect_url_not_allowed" Error
- The redirect URL used doesn't match Clerk Dashboard settings
- Add the exact URL shown in the error to Allowed Redirect URLs

### OAuth Button Does Nothing
- Check browser console for errors
- Verify OAuth provider is enabled in Clerk Dashboard
- Check that redirect URLs include your domain

### Mobile OAuth Not Returning to App
- Verify URL scheme matches capacitor.config.ts
- Check that intent filters are properly configured
- Ensure app is properly signed for iOS/Android
