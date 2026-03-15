#!/usr/bin/env node
// Development server wrapper that handles restart issues

import { spawn } from 'child_process';
import { watch } from 'fs';
import path from 'path';

const SERVER_DIR = path.join(process.cwd(), 'server');
const IGNORE_PATTERNS = [
  /vite\.config\.ts\.timestamp/,
  /\.timestamp-/,
  /node_modules/,
  /dist/,
  /ios/,
  /android/,
  /src/
];

let serverProcess = null;
let restartTimeout = null;

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function startServer() {
  if (serverProcess) {
    serverProcess.kill();
  }

  console.log('\n🚀 Starting server...\n');
  
  serverProcess = spawn('node', ['--import=tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: process.env
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`Server exited with code ${code}`);
    }
  });
}

function restartServer() {
  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }
  
  restartTimeout = setTimeout(() => {
    startServer();
  }, 100); // Debounce restarts
}

// Watch server directory
const watcher = watch(SERVER_DIR, { recursive: true }, (eventType, filename) => {
  if (filename && shouldIgnore(filename)) {
    return;
  }
  
  console.log(`\n📝 File changed: ${filename}`);
  restartServer();
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down...');
  watcher.close();
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  watcher.close();
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

// Start initial server
startServer();
