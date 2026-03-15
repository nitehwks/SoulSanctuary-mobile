#!/bin/bash

echo "=== KILLING ALL PROCESSES ==="
pkill -9 -f "node\|tsx\|vite" 2>/dev/null || true
sleep 2

echo ""
echo "=== CHECKING API KEY ==="
API_KEY=$(grep "OPENROUTER_API_KEY=" .env.local | head -1 | cut -d'=' -f2)
echo "API Key found: ${API_KEY:0:20}..."

if [[ $API_KEY == sk-or-v1-* ]]; then
    echo "✅ API Key format looks correct (sk-or-v1-...)"
elif [[ $API_KEY == sk-* ]]; then
    echo "⚠️  API Key starts with sk- but should be sk-or-v1- for OpenRouter"
else
    echo "❌ API Key format looks wrong"
fi

echo ""
echo "=== CHECKING CAPACITOR CONFIG ==="
grep -A3 "server:" capacitor.config.ts

echo ""
echo "=== CHECKING IP ADDRESS ===
echo "Your computer's IP:"
ipconfig getifaddr en0

echo ""
echo "=== STARTING BACKEND SERVER ==="
node --import=tsx server/index.ts > /tmp/server.log 2>&1 &
SERVER_PID=$!
sleep 4

echo "Testing backend health..."
curl -s http://localhost:3001/health
echo ""

echo ""
echo "=== TESTING CHAT API DIRECTLY ==="
curl -s -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, how are you?","history":[],"mode":"general"}'
echo ""

echo ""
echo "=== SERVER LOGS ==="
tail -30 /tmp/server.log

kill $SERVER_PID 2>/dev/null || true
echo ""
echo "=== DEBUG COMPLETE ==="
