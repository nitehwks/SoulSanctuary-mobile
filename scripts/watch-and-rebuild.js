#!/usr/bin/env node
/**
 * SoulSanctuary - Watch and Rebuild Script
 * 
 * Automatically rebuilds web and mobile apps when source code changes.
 * Usage: node scripts/watch-and-rebuild.js [platforms]
 * 
 * Platforms: all (default), web, ios, android
 * Examples:
 *   node scripts/watch-and-rebuild.js           # Watch all platforms
 *   node scripts/watch-and-rebuild.js web       # Watch web only
 *   node scripts/watch-and-rebuild.js ios       # Watch and rebuild iOS
 *   node scripts/watch-and-rebuild.js android   # Watch and rebuild Android
 */

import { spawn } from 'child_process';
import { watch } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const targetPlatform = args[0] || 'all';

// Configuration
const WATCH_DIRS = [
  'src',
  'server',
];

const IGNORE_PATTERNS = [
  /node_modules/,
  /dist/,
  /ios\/App\/build/,
  /ios\/App\/Pods/,
  /android\/app\/build/,
  /android\/\.gradle/,
  /\.git/,
  /logs/,
  /releases/,
  /vite\.config\.ts\.timestamp/,
  /\.timestamp-/,
  /\.DS_Store/,
  /sw\.js/,
  /workbox-/,
];

// State
let isBuilding = false;
let pendingBuild = false;
let buildTimeout = null;

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log('');
}

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: PROJECT_ROOT,
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function buildWeb() {
  log('Building web app...', 'yellow');
  try {
    await runCommand('npm', ['run', 'build']);
    log('✅ Web build successful', 'green');
    return true;
  } catch (error) {
    log('❌ Web build failed', 'red');
    console.error(error.message);
    return false;
  }
}

async function syncCapacitor() {
  log('Syncing Capacitor platforms...', 'yellow');
  try {
    await runCommand('npx', ['cap', 'sync']);
    log('✅ Capacitor sync successful', 'green');
    return true;
  } catch (error) {
    log('❌ Capacitor sync failed', 'red');
    console.error(error.message);
    return false;
  }
}

async function buildIOS() {
  log('Building iOS app...', 'yellow');
  try {
    // Change to iOS directory and build
    const iosDir = path.join(PROJECT_ROOT, 'ios', 'App');
    
    // First, ensure pods are installed
    log('Installing CocoaPods...', 'dim');
    await runCommand('pod', ['install'], { cwd: iosDir });
    
    // Build using xcodebuild
    log('Running xcodebuild...', 'dim');
    await runCommand('xcodebuild', [
      '-workspace', 'App.xcworkspace',
      '-scheme', 'App',
      '-configuration', 'Debug',
      '-destination', 'platform=iOS Simulator,name=iPhone 15',
      'build'
    ], { cwd: iosDir });
    
    log('✅ iOS build successful', 'green');
    return true;
  } catch (error) {
    log('❌ iOS build failed', 'red');
    console.error(error.message);
    return false;
  }
}

async function buildAndroid() {
  log('Building Android app...', 'yellow');
  try {
    const androidDir = path.join(PROJECT_ROOT, 'android');
    
    // Build using gradlew
    await runCommand('./gradlew', ['assembleDebug'], { cwd: androidDir });
    
    log('✅ Android build successful', 'green');
    return true;
  } catch (error) {
    log('❌ Android build failed', 'red');
    console.error(error.message);
    return false;
  }
}

async function performBuild() {
  if (isBuilding) {
    pendingBuild = true;
    log('Build already in progress, queueing...', 'dim');
    return;
  }

  isBuilding = true;
  pendingBuild = false;
  
  const startTime = Date.now();
  logSection('STARTING BUILD');

  try {
    // Step 1: Build Web
    if (targetPlatform === 'all' || targetPlatform === 'web') {
      const webSuccess = await buildWeb();
      if (!webSuccess && targetPlatform === 'web') {
        throw new Error('Web build failed');
      }
    }

    // Step 2: Sync Capacitor (needed for mobile builds)
    if (targetPlatform === 'all' || targetPlatform === 'ios' || targetPlatform === 'android') {
      const syncSuccess = await syncCapacitor();
      if (!syncSuccess) {
        throw new Error('Capacitor sync failed');
      }
    }

    // Step 3: Build iOS
    if (targetPlatform === 'all' || targetPlatform === 'ios') {
      await buildIOS();
    }

    // Step 4: Build Android
    if (targetPlatform === 'all' || targetPlatform === 'android') {
      await buildAndroid();
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logSection(`BUILD COMPLETE in ${duration}s`);
    
  } catch (error) {
    logSection('BUILD FAILED');
    console.error(error.message);
  } finally {
    isBuilding = false;
    
    // If a build was requested during the current build, run it now
    if (pendingBuild) {
      log('Running pending build...', 'yellow');
      setTimeout(performBuild, 100);
    }
  }
}

function debouncedBuild() {
  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }
  
  buildTimeout = setTimeout(() => {
    performBuild();
  }, 500); // Wait 500ms after last change before building
}

// Setup watchers
function setupWatchers() {
  logSection('WATCH AND REBUILD');
  log(`Target: ${colors.bright}${targetPlatform}${colors.reset}`);
  log(`Watching directories: ${WATCH_DIRS.join(', ')}`);
  log('Press Ctrl+C to stop\n', 'dim');

  // Perform initial build
  performBuild();

  // Setup file watchers
  WATCH_DIRS.forEach(dir => {
    const fullPath = path.join(PROJECT_ROOT, dir);
    
    try {
      const watcher = watch(fullPath, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        
        const fullFilePath = path.join(fullPath, filename);
        
        if (shouldIgnore(fullFilePath)) {
          return;
        }
        
        log(`📝 ${eventType}: ${path.relative(PROJECT_ROOT, fullFilePath)}`, 'blue');
        debouncedBuild();
      });

      watcher.on('error', (error) => {
        log(`Watcher error: ${error.message}`, 'red');
      });

      log(`✅ Watching ${dir}/`, 'green');
    } catch (error) {
      log(`Failed to watch ${dir}: ${error.message}`, 'red');
    }
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n👋 Stopping watcher...', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Start
setupWatchers();
