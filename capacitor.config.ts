import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soulsanctuary.app',
  appName: 'SoulSanctuary',
  webDir: 'dist',
  
  // ==========================================
  // DEVELOPMENT MODE (Live Reload)
  // ==========================================
  // Uncomment this block for development with live reload:
  // 1. Get your computer's IP: ipconfig getifaddr en0
  // 2. Replace 192.168.x.x with your actual IP
  // 3. Run: npm run dev (starts frontend on port 3000)
  // 4. Run: npm run server:dev (starts backend on port 3001)
  // 5. Run: npx cap sync ios
  // 6. Run: npx cap open ios
  //
  // server: {
  //   url: 'http://10.1.10.40:3000',  // REPLACE with your IP
  //   cleartext: true,
  // },
  
  // ==========================================
  // PRODUCTION MODE (Static Build)
  // ==========================================
  // Comment out the server block above for production builds
  // The app will use static files from the dist folder
  // Make sure to set VITE_API_URL in .env.local to your backend URL
  
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1a1a2e",
    },
  },
  ios: {
    scheme: 'SoulSanctuary',
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true,
    handleApplicationNotifications: true,
  },
  android: {
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: {
          scheme: 'soulsanctuary',
          host: 'auth'
        },
        category: ['BROWSABLE', 'DEFAULT']
      }
    ],
    useLegacyBridge: false,
  }
};

export default config;
