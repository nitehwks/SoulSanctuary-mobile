i#!/bin/bash
# GitHub Setup Script - Creates repo and pushes all 69 files

echo "🌐 Setting up GitHub repository..."

# Initialize git if not already
git init

# Create .gitignore for mobile projects
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
dist-ssr/
*.local

# Capacitor native builds (keep config, ignore build artifacts)
ios/App/build/
ios/App/Pods/
ios/App/App.xcworkspace/xcuserdata/
ios/App/DerivedData/
android/app/build/
android/.gradle/
android/local.properties
android/.idea/
android/captures/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/*
!.vscode/extensions.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS
.DS_Store
Thumbs.db
EOF

# Add all files
git add .

# Initial commit
git commit -m "feat: SoulSanctuary v2.0 - Complete mobile-ready mental health app
- React 18 frontend with TypeScript
- Express backend with Drizzle ORM
- Capacitor iOS/Android integration
- 67+ files including AI insights, mood tracking, goal coaching
- End-to-end encryption & crisis detection
- PWA support with offline capabilities"

# Create GitHub repo via CLI (install gh if needed: https://cli.github.com)
# Uncomment if you have gh CLI installed:
# gh repo create soulsanctuary-mobile --public --source=. --remote=origin --push

# Alternative: Manual GitHub setup
echo ""
echo "🔗 MANUAL GITHUB SETUP:"
echo "1. Go to https://github.com/new"
echo "2. Name: soulsanctuary-mobile"
echo "3. Don't initialize with README (we have one)"
echo "4. Run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/soulsanctuary-mobile.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

read -p "Press Enter after creating the GitHub repo to push..."

# Push to GitHub
git branch -M main
git push -u origin main

echo "✅ Pushed to GitHub!"

