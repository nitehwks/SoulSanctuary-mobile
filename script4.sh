#!/bin/bash
# iOS Xcode Project Configuration Script
# Run this after first sync to fix common iOS issues

echo "🍎 Configuring Xcode project..."

cd ios/App

# Fix AppDelegate.swift for Capacitor 5+
cat > App/AppDelegate.swift << 'EOF'
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
    
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
EOF

# Update Info.plist for security and permissions
/usr/libexec/PlistBuddy -c "Add :NSFaceIDUsageDescription string 'Use Face ID to unlock your sanctuary'" App/Info.plist 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :NSCameraUsageDescription string 'Camera access for profile photo'" App/Info.plist 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryUsageDescription string 'Photo library access for profile images'" App/Info.plist 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" App/Info.plist 2>/dev/null || true

cd ../..

echo "✅ iOS configured!"
echo "Open Xcode with: npx cap open ios"
echo ""
echo "⚠️  IN XCODE:"
echo "1. Select App target → Signing & Capabilities"
echo "2. Set Team to your Apple Developer account"
echo "3. Set Bundle Identifier: com.soulsanctuary.app"
echo "4. Build (Cmd+B) then Run (Cmd+R)"

