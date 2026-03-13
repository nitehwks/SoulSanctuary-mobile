#!/bin/bash
# Build and Sync Script - Opens Xcode & Android Studio

echo "🔨 Building SoulSanctuary..."

# Build the web app
npm run build

# Sync Capacitor with web build
npx cap sync

# Copy web assets to native platforms
npx cap copy ios
npx cap copy android

echo "📱 Opening Xcode..."
npx cap open ios

echo "🤖 Opening Android Studio..."
npx cap open android

echo "✅ IDEs opened! You can now build for iOS/Android"

