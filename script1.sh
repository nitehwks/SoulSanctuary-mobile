#!/bin/bash
# SoulSanctuary Mobile Setup Script
# Run this in your project root

echo "🚀 Setting up SoulSanctuary for Mobile..."

# Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Create capacitor.config.ts
cat > capacitor.config.ts << 'EOF'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soulsanctuary.app',
  appName: 'SoulSanctuary',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e"
    }
  }
};

export default config;
EOF

# Add iOS platform
npx cap add ios

# Add Android platform  
npx cap add android

echo "✅ Capacitor platforms added!"
echo "Next: Run ./build-and-sync.sh"

