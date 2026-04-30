#!/bin/bash

# Telegram Bot Webhook Setup Script
# Automatically sets up webhook for Barber Agent Telegram Bot

set -e

echo "🤖 Barber Agent - Telegram Bot Webhook Setup"
echo "============================================="
echo ""

# Check environment
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production not found"
    echo "Please create .env.production with:"
    echo "  TELEGRAM_BOT_TOKEN=your_token"
    echo "  TELEGRAM_ADMIN_CHAT_ID=your_chat_id"
    exit 1
fi

# Load environment
set -a
source .env.production
set +a

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ Error: TELEGRAM_BOT_TOKEN not set in .env.production"
    exit 1
fi

if [ -z "$TELEGRAM_ADMIN_CHAT_ID" ]; then
    echo "❌ Error: TELEGRAM_ADMIN_CHAT_ID not set in .env.production"
    exit 1
fi

echo "✅ Environment loaded"
echo "   Bot Token: ${TELEGRAM_BOT_TOKEN:0:20}..."
echo "   Chat ID: $TELEGRAM_ADMIN_CHAT_ID"
echo ""

# Step 1: Deploy functions
echo "📦 Deploying Cloud Functions..."
firebase deploy --only functions 2>&1 | grep -E "(deployed|Deployed|Error|error)" || true

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 10

# Step 2: Get webhook URL
echo "🔍 Finding webhook URL..."

# Try to get from Firebase Console API or ask user
echo ""
echo "After deployment, find your webhook URL:"
echo "1. Go to Firebase Console → Functions"
echo "2. Click telegramBotWebhook"
echo "3. Copy the Trigger URL"
echo ""
read -p "Paste webhook URL here: " WEBHOOK_URL

if [ -z "$WEBHOOK_URL" ]; then
    echo "❌ No webhook URL provided"
    exit 1
fi

echo ""
echo "🔗 Setting webhook for Telegram bot..."
echo "   Webhook: $WEBHOOK_URL"
echo ""

# Step 3: Test webhook setup
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=${WEBHOOK_URL}" \
  -d "allowed_updates=[\"message\"]")

echo "📤 Telegram API Response:"
echo "$RESPONSE" | jq '.' || echo "$RESPONSE"

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo ""
    echo "✅ Webhook set successfully!"
    echo ""
    echo "🧪 Testing bot..."
    
    # Send test message
    TEST_MSG="🤖 Barber Agent Bot is now online!
    
Try commands:
/status → System status
/customers → List all customers
/revenue → Today's revenue
/health → Health scores
/help → Show all commands"
    
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_ADMIN_CHAT_ID}" \
      -d "text=${TEST_MSG}" \
      -d "parse_mode=Markdown" > /dev/null
    
    echo "✅ Test message sent to your Telegram chat"
    echo ""
    echo "🎉 Telegram Bot Setup Complete!"
    echo ""
    echo "Next steps:"
    echo "1. Open Telegram and check your chat"
    echo "2. Try /status to see system status"
    echo "3. Set up daily reports (webhook is now active)"
    
else
    echo ""
    echo "❌ Failed to set webhook"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check webhook URL is correct"
    echo "2. Check TELEGRAM_BOT_TOKEN is valid"
    echo "3. Try manually: curl -X POST https://api.telegram.org/bot{TOKEN}/getMe"
fi

echo ""
echo "============================================="
echo "Setup complete! Check your Telegram chat."
