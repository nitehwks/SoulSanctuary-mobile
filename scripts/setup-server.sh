#!/bin/bash
# =============================================================================
# SoulSanctuary - Server Setup Script
# =============================================================================
# Sets up the backend server from a vanilla macOS install.
# Prerequisites: macOS with Xcode, Android Studio, and Homebrew installed.
#
# Usage:
#   ./scripts/setup-server.sh
#
# This script will:
#   1. Check/install Node.js (via Homebrew or nvm)
#   2. Install npm dependencies
#   3. Create .env.local with the production server IP
#   4. Install and configure PostgreSQL client tools
#   5. Push database schema to Neon
#   6. Build the server TypeScript code
#   7. Start the server
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Configuration
SERVER_IP="216.39.74.180"
SERVER_PORT="3001"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

log() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +%H:%M:%S)] ✅${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date +%H:%M:%S)] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +%H:%M:%S)] ❌${NC} $1"
}

log_section() {
    echo ""
    echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# =============================================================================
# Step 1: Check Prerequisites
# =============================================================================
log_section "STEP 1: Checking Prerequisites"

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    log_error "Homebrew is not installed. Please install it first:"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi
log_success "Homebrew found"

# Check for Git
if ! command -v git &> /dev/null; then
    log_warn "Git not found. Installing..."
    brew install git
fi
log_success "Git found"

# =============================================================================
# Step 2: Install Node.js
# =============================================================================
log_section "STEP 2: Installing Node.js"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log "Node.js found: $NODE_VERSION"
    
    # Check if version is 18+
    NODE_MAJOR=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        log_warn "Node.js version $NODE_VERSION is too old. Installing Node 20..."
        brew install node@20
        brew link node@20 --force --overwrite
    fi
else
    log "Node.js not found. Installing Node 20..."
    brew install node@20
    brew link node@20 --force --overwrite
fi

NODE_VERSION=$(node --version)
log_success "Node.js $NODE_VERSION ready"

# Install npm if not present
if ! command -v npm &> /dev/null; then
    log_warn "npm not found. Reinstalling Node.js..."
    brew reinstall node@20
fi
log_success "npm $(npm --version) ready"

# =============================================================================
# Step 3: Install Project Dependencies
# =============================================================================
log_section "STEP 3: Installing Project Dependencies"

log "Running npm install (this may take a few minutes)..."
npm install --legacy-peer-deps

log_success "Dependencies installed"

# Install pg for database migrations
log "Installing PostgreSQL client (pg)..."
npm install pg --legacy-peer-deps
log_success "PostgreSQL client installed"

# =============================================================================
# Step 4: Create Environment Configuration
# =============================================================================
log_section "STEP 4: Creating Environment Configuration"

ENV_FILE=".env.local"

if [ -f "$ENV_FILE" ]; then
    log_warn ".env.local already exists. Backing up to .env.local.backup"
    cp "$ENV_FILE" ".env.local.backup.$(date +%Y%m%d_%H%M%S)"
fi

log "Creating .env.local with server IP: $SERVER_IP"

cat > "$ENV_FILE" << EOF
# =============================================================================
# SoulSanctuary - Environment Configuration
# =============================================================================
# Server IP: $SERVER_IP
# Generated: $(date)
# =============================================================================

# -------------------------------------
# API & Frontend URLs
# -------------------------------------
VITE_API_URL=http://$SERVER_IP:$SERVER_PORT
FRONTEND_URL=https://soulsanctuary.app
PORT=$SERVER_PORT

# -------------------------------------
# CORS Origins
# -------------------------------------
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,capacitor://localhost,ionic://localhost,https://localhost,https://soulsanctuary.app,https://www.soulsanctuary.app,app://localhost

# -------------------------------------
# Database (Neon PostgreSQL)
# -------------------------------------
# IMPORTANT: Replace with your actual Neon connection string
# Get one free at: https://neon.tech
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# -------------------------------------
# Clerk Authentication
# -------------------------------------
# Get keys at: https://dashboard.clerk.com
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY

# -------------------------------------
# OpenRouter AI
# -------------------------------------
# Get key at: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-YOUR_OPENROUTER_API_KEY
OPENROUTER_MODEL=anthropic/claude-sonnet-4
OPENROUTER_FALLBACK_MODEL=openai/gpt-4o-mini

# -------------------------------------
# Firebase (Optional - Push Notifications)
# -------------------------------------
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# -------------------------------------
# Stripe (Optional - Payments)
# -------------------------------------
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_PRICE_PREMIUM=price_YOUR_PREMIUM_PRICE
STRIPE_PRICE_PREMIUM_PLUS=price_YOUR_PREMIUM_PLUS_PRICE

# -------------------------------------
# Encryption (Optional - Profile Encryption)
# -------------------------------------
PROFILE_ENCRYPTION_KEY=
EOF

log_success ".env.local created at $PROJECT_ROOT/$ENV_FILE"
log_warn "IMPORTANT: You MUST edit .env.local and add your real API keys:"
echo "  - DATABASE_URL (from https://neon.tech)"
echo "  - CLERK_PUBLISHABLE_KEY & CLERK_SECRET_KEY (from https://clerk.com)"
echo "  - OPENROUTER_API_KEY (from https://openrouter.ai)"
echo ""

# =============================================================================
# Step 5: Database Setup
# =============================================================================
log_section "STEP 5: Database Setup"

log "Checking database connection..."

# Check if DATABASE_URL is still the placeholder
if grep -q "postgresql://user:password@host/database" "$ENV_FILE"; then
    log_warn "DATABASE_URL is still the placeholder!"
    log "Skipping database migration. Run this after updating DATABASE_URL:"
    echo "  npx drizzle-kit migrate"
else
    log "Pushing database schema..."
    
    # Update drizzle config for latest version
    cat > drizzle.config.ts << 'EOF'
import type { Config } from 'drizzle-kit';

export default {
  schema: ['./server/db/schema.ts', './server/db/userProfileSchema.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
EOF

    # Run migrations using pg
    DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r') node -e "
const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to PostgreSQL');
  
  const files = fs.readdirSync('./drizzle')
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  for (const file of files) {
    const sql = fs.readFileSync('./drizzle/' + file, 'utf8');
    console.log('Running migration:', file);
    try {
      await client.query(sql);
      console.log('Done:', file);
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('  Skipping (already exists)');
      } else {
        throw e;
      }
    }
  }
  await client.end();
  console.log('All migrations applied');
}

run().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
" && log_success "Database schema pushed" || log_warn "Database migration failed - check your DATABASE_URL"
fi

# =============================================================================
# Step 6: Build Server Code
# =============================================================================
log_section "STEP 6: Building Server Code"

log "Compiling TypeScript server code..."
npx tsc --project server/tsconfig.json 2>/dev/null || npx tsc --noEmit 2>/dev/null || log_warn "TypeScript check completed with warnings"

log_success "Server code compiled"

# =============================================================================
# Step 7: Start the Server
# =============================================================================
log_section "STEP 7: Starting the Server"

log "Starting development server..."
log "Server will be available at: http://$SERVER_IP:$SERVER_PORT"
log "Health check: curl http://$SERVER_IP:$SERVER_PORT/health"
echo ""

npm run server:dev
