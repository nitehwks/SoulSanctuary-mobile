#!/bin/bash
# Android Studio Configuration Script

echo "🤖 Configuring Android project..."

cd android

# Fix gradle properties for better builds
cat >> gradle.properties << 'EOF'

# SoulSanctuary Optimizations
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
EOF

# Update AndroidManifest.xml with permissions
cat > app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.soulsanctuary.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name="com.soulsanctuary.app.MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>

</manifest>
EOF

cd ..

echo "✅ Android configured!"
echo "Open Android Studio with: npx cap open android"
echo ""
echo "⚠️  IN ANDROID STUDIO:"
echo "1. Sync Project with Gradle Files (elephant icon)"
echo "2. Build → Make Project (Cmd+F9)"
echo "3. Run → Run 'app' (Shift+F10)"
echo ""
echo "🔐 For release build:"
echo "./android/gradlew assembleRelease"

