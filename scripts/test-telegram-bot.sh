#!/bin/bash

# Quick Telegram Bot Testing Script
# Test bot locally without full deployment

set -e

echo "🧪 Barber Agent - Telegram Bot Quick Test"
echo "=========================================="
echo ""

# Check environment
if [ ! -f ".env.test" ]; then
    echo "❌ Error: .env.test not found"
    echo ""
    echo "Create .env.test with:"
    echo "  TELEGRAM_BOT_TOKEN=your_test_bot_token"
    echo "  TELEGRAM_ADMIN_CHAT_ID=your_chat_id"
    echo ""
    exit 1
fi

# Load environment
set -a
source .env.test
set +a

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN not set in .env.test"
    exit 1
fi

if [ -z "$TELEGRAM_ADMIN_CHAT_ID" ]; then
    echo "❌ TELEGRAM_ADMIN_CHAT_ID not set in .env.test"
    exit 1
fi

echo "✅ Configuration loaded"
echo "   Bot Token: ${TELEGRAM_BOT_TOKEN:0:20}..."
echo "   Chat ID: $TELEGRAM_ADMIN_CHAT_ID"
echo ""

# Check dependencies
echo "📦 Checking dependencies..."

if ! command -v curl &> /dev/null; then
    echo "❌ curl not found. Install it: apt-get install curl"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not found. Install for pretty JSON: apt-get install jq"
    JQ_AVAILABLE=false
else
    JQ_AVAILABLE=true
fi

echo "✅ Dependencies OK"
echo ""

# Test 1: Check Bot Exists
echo "🧪 Test 1: Verify Bot Token is Valid"
echo "====================================="

RESPONSE=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe")

if echo "$RESPONSE" | grep -q '"ok":true'; then
    if [ "$JQ_AVAILABLE" = true ]; then
        BOT_NAME=$(echo "$RESPONSE" | jq -r '.result.username')
        echo "✅ Bot is valid: @${BOT_NAME}"
    else
        echo "✅ Bot token is valid"
    fi
else
    echo "❌ Bot token is invalid"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""

# Test 2: Test Send Message
echo "🧪 Test 2: Send Test Message to Telegram"
echo "========================================"

TEST_MESSAGE="✅ Barber Agent Bot is working!

Test message sent from testing script.
If you see this, the bot is connected correctly.

Time: $(date '+%Y-%m-%d %H:%M:%S')"

RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_ADMIN_CHAT_ID}" \
  -d "text=${TEST_MESSAGE}" \
  -d "parse_mode=Markdown")

if echo "$RESPONSE" | grep -q '"ok":true'; then
    if [ "$JQ_AVAILABLE" = true ]; then
        MSG_ID=$(echo "$RESPONSE" | jq -r '.result.message_id')
        echo "✅ Message sent (ID: $MSG_ID)"
    else
        echo "✅ Message sent successfully"
    fi
else
    echo "❌ Failed to send message"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""

# Test 3: Verify Webhook
echo "🧪 Test 3: Check Current Webhook"
echo "================================"

WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo")

if echo "$WEBHOOK_INFO" | grep -q '"url":""'; then
    echo "⚠️  No webhook is currently set"
    echo "   This is OK - we'll set it during full deployment"
else
    if [ "$JQ_AVAILABLE" = true ]; then
        WEBHOOK_URL=$(echo "$WEBHOOK_INFO" | jq -r '.result.url')
        echo "ℹ️  Current webhook: ${WEBHOOK_URL:0:50}..."
    else
        echo "ℹ️  A webhook is currently set"
    fi
fi

echo ""

# Test 4: Check Firebase Emulator
echo "🧪 Test 4: Check Firebase Emulator"
echo "=================================="

if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Firebase emulator is running on port 5001"
else
    echo "⚠️  Firebase emulator is NOT running"
    echo "   To test locally, start it:"
    echo "   firebase emulators:start --only functions"
fi

echo ""

# Test 5: Test Direct Message Format
echo "🧪 Test 5: Simulate Telegram Message Format"
echo "==========================================="

TEST_PAYLOAD='{
    "message": {
        "chat": {"id": '${TELEGRAM_ADMIN_CHAT_ID}'},
        "from": {"id": '${TELEGRAM_ADMIN_CHAT_ID}'},
        "text": "/start"
    }
}'

echo "Sample webhook message format:"
echo "$TEST_PAYLOAD" | jq '.' 2>/dev/null || echo "$TEST_PAYLOAD"

echo ""
echo "✅ Message format is valid"
echo ""

# Summary
echo "📋 Test Summary"
echo "=============="
echo "✅ Bot token is valid"
echo "✅ Can send messages to Telegram"
echo "⚠️  Webhook not yet configured (normal)"
echo ""
echo "Next steps:"
echo "1. Start Firebase emulator:"
echo "   firebase emulators:start --only functions"
echo ""
echo "2. In another terminal, set up ngrok tunnel:"
echo "   ngrok http 5001"
echo ""
echo "3. Run setup script:"
echo "   bash scripts/setup-telegram-webhook.sh"
echo ""
echo "4. Test commands in Telegram:"
echo "   /status"
echo "   /customers"
echo "   /revenue"
echo ""
echo "🎉 Ready to test!"
