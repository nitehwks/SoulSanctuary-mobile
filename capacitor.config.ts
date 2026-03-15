import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soulsanctuary.app',
  appName: 'SoulSanctuary',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // For development - use local server
    // url: 'http://192.168.1.xxx:5173',
    // cleartext: true,
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
    // Handle OAuth callbacks
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
