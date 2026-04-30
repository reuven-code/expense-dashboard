# 🧪 Telegram Bot Testing Guide

**Goal:** Test all Telegram Bot features locally before deploying to production

---

## **🔧 Quick Setup (5 minutes)**

### Step 1: Create Test Bot

1. Open Telegram
2. Search **@BotFather**
3. Send `/newbot`
4. Name it: `Barber Agent Test Bot` (or any name)
5. Username: `barber_agent_test_bot_YOUR_NAME`
6. **Copy the API Token** (save it!)

**Example Token:** `123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh`

---

### Step 2: Get Your Chat ID

1. Search **@userinfobot**
2. Send any message
3. Copy your **User ID** (the number, e.g., `987654321`)

---

### Step 3: Set Environment Variables

```bash
cd /tmp/barber-agent-platform

# Create .env.test file
cat > .env.test << EOF
NODE_ENV=test
FIREBASE_PROJECT_ID=barber-agent-prod
TELEGRAM_BOT_TOKEN=your_test_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_chat_id_here
GEMINI_API_KEY=test_key_or_real_key
EOF
```

**Replace:**
- `your_test_bot_token_here` → Paste your token from @BotFather
- `your_chat_id_here` → Paste your user ID from @userinfobot

---

## **✅ Test 1: Local Function Testing (No Deploy)**

### Run Telegram Bot Functions Locally

```bash
# Install dependencies
cd functions
npm install

# Start Firebase emulator
firebase emulators:start --only functions

# In a new terminal, test the webhook locally
cd /tmp/barber-agent-platform

# Test 1: Send a test message to the bot function
curl -X POST http://localhost:5001/barber-agent-prod/us-central1/telegramBotWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "chat": {"id": YOUR_CHAT_ID},
      "from": {"id": YOUR_USER_ID},
      "text": "/status"
    }
  }'
```

**Expected Output:**
```json
{
  "ok": true,
  "result": {
    "message_id": 12345,
    "chat": {"id": YOUR_CHAT_ID},
    "text": "✅ System Status..."
  }
}
```

---

## **✅ Test 2: Test Each Command Locally**

Create a test script:

```bash
cat > scripts/test-telegram-commands.sh << 'EOF'
#!/bin/bash

set -e

echo "🧪 Testing Telegram Bot Commands..."
echo ""

WEBHOOK_URL="http://localhost:5001/barber-agent-prod/us-central1/telegramBotWebhook"
CHAT_ID=$TELEGRAM_ADMIN_CHAT_ID
USER_ID=$TELEGRAM_ADMIN_CHAT_ID

# Test /status
echo "📌 Test 1: /status"
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": {
      \"chat\": {\"id\": $CHAT_ID},
      \"from\": {\"id\": $USER_ID},
      \"text\": \"/status\"
    }
  }" | jq '.' || echo "Failed"

echo ""

# Test /customers
echo "📌 Test 2: /customers"
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": {
      \"chat\": {\"id\": $CHAT_ID},
      \"from\": {\"id\": $USER_ID},
      \"text\": \"/customers\"
    }
  }" | jq '.' || echo "Failed"

echo ""

# Test /revenue
echo "📌 Test 3: /revenue"
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": {
      \"chat\": {\"id\": $CHAT_ID},
      \"from\": {\"id\": $USER_ID},
      \"text\": \"/revenue\"
    }
  }" | jq '.' || echo "Failed"

echo ""

# Test /health
echo "📌 Test 4: /health"
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": {
      \"chat\": {\"id\": $CHAT_ID},
      \"from\": {\"id\": $USER_ID},
      \"text\": \"/health\"
    }
  }" | jq '.' || echo "Failed"

echo ""

# Test /help
echo "📌 Test 5: /help"
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": {
      \"chat\": {\"id\": $CHAT_ID},
      \"from\": {\"id\": $USER_ID},
      \"text\": \"/help\"
    }
  }" | jq '.' || echo "Failed"

echo ""
echo "✅ All command tests completed!"
EOF

chmod +x scripts/test-telegram-commands.sh
```

Run it:
```bash
source .env.test
firebase emulators:start --only functions &
sleep 5
bash scripts/test-telegram-commands.sh
```

---

## **✅ Test 3: Deploy to Firebase Emulator + Telegram**

### 3a: Start Firebase Emulator

```bash
cd /tmp/barber-agent-platform
source .env.test
firebase emulators:start --only functions
```

**Output:**
```
✔ functions: http function initialized (http://localhost:5001/barber-agent-prod/us-central1/telegramBotWebhook)
✔ All emulators ready! It is now safe to start your application.
```

### 3b: Create Local Webhook Tunnel (ngrok)

In a new terminal:

```bash
# Install ngrok (if not already installed)
# Mac: brew install ngrok
# Linux: wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.zip && unzip

# Expose local Firebase emulator to the internet
ngrok http 5001
```

**Output:**
```
Session Status                online
Forwarding                    https://abcd1234.ngrok.io -> http://localhost:5001
```

Copy the HTTPS URL (e.g., `https://abcd1234.ngrok.io`)

### 3c: Set Telegram Webhook to Your Tunnel

```bash
# Replace TOKEN with your test bot token
TOKEN=$TELEGRAM_BOT_TOKEN
NGROK_URL="https://abcd1234.ngrok.io/barber-agent-prod/us-central1/telegramBotWebhook"

curl -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -d "url=${NGROK_URL}" \
  -d "allowed_updates=[\"message\"]"
```

**Expected Response:**
```json
{"ok": true, "result": true, "description": "Webhook was set"}
```

### 3d: Test in Telegram

1. Search for your test bot: `@barber_agent_test_bot_YOUR_NAME`
2. Send `/start` — Should see help menu
3. Send `/status` — Should see system status
4. Send `/customers` — Should list all customers
5. Send `/revenue` — Should show revenue
6. Send `/health` — Should show health scores

**Check logs in Terminal:**
```
functions[us-central1-telegramBotWebhook]: Function execution took 123 ms
functions[us-central1-telegramBotWebhook]: ✅ Telegram message sent
```

---

## **✅ Test 4: Test Daily Report Job**

### 4a: Trigger Manually

The daily report runs at 6 AM Israel time. To test it manually:

```bash
# Test the report generation function directly
node -e "
const { generateDailyReport } = require('./functions/lib/telegram-bot.js');
generateDailyReport().then(report => console.log(report));
"
```

### 4b: Verify Cloud Scheduler

```bash
# List all scheduled jobs
gcloud scheduler jobs list

# Should see:
# NAME                           LOCATION       SCHEDULE        TIMEZONE           NEXT_RUN
# dailyReportJob                us-central1    0 6 * * *       Asia/Jerusalem     2026-05-27T06:00:00Z
```

---

## **✅ Test 5: Test Alert Triggers**

### 5a: Test New Customer Alert

```bash
# Manually add a test shop to Firestore
firebase firestore:set shops/test-shop-001 \
  --data '{
    "name": "Test Barbershop",
    "city": "Tel Aviv",
    "plan": "trial",
    "status": "active",
    "health_score": 85
  }'
```

**Expected:** Telegram message arrives: `🎉 New Customer! Shop: Test Barbershop`

### 5b: Test Churn Risk Alert

```bash
# Update a shop's health score to trigger alert
firebase firestore:update shops/test-shop-001 \
  --update 'health_score=50'
```

**Expected:** Telegram message: `🚨 Churn Risk Alert! Shop: Test Barbershop`

### 5c: Test Error Alert

```bash
# Create a critical error log
firebase firestore:set error_logs/test-error-001 \
  --data '{
    "severity": "critical",
    "message": "Database connection failed",
    "shop_id": "test-shop-001",
    "stack": "Error: ECONNREFUSED..."
  }'
```

**Expected:** Telegram message: `🚨 CRITICAL ERROR`

---

## **✅ Test 6: Security Testing**

### 6a: Test Unauthorized Access

```bash
# Try to send command from different chat ID
curl -X POST "http://localhost:5001/barber-agent-prod/us-central1/telegramBotWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "chat": {"id": 111111111},
      "from": {"id": 222222222},
      "text": "/status"
    }
  }'
```

**Expected Response:**
```json
{"error": "Unauthorized", "status": 403}
```

### 6b: Test Invalid Token

```bash
# Try with wrong bot token
curl -X POST "https://api.telegram.org/bot/INVALID_TOKEN/sendMessage" \
  -d "chat_id=123" \
  -d "text=test"
```

**Expected:** 401 Unauthorized

---

## **✅ Test 7: Performance Testing**

### Test Response Time

```bash
# Time how long /status takes
time curl -s -X POST "http://localhost:5001/barber-agent-prod/us-central1/telegramBotWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "chat": {"id": YOUR_CHAT_ID},
      "from": {"id": YOUR_USER_ID},
      "text": "/status"
    }
  }' > /dev/null

# Should be < 500ms
```

---

## **✅ Test 8: Full End-to-End Test**

### Simulate a Day in Production

```bash
# 1. Deploy to Firebase emulator
firebase emulators:start --only functions &

# 2. Expose via ngrok
ngrok http 5001 &

# 3. Set webhook
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=https://YOUR_NGROK_URL/barber-agent-prod/us-central1/telegramBotWebhook"

# 4. Test commands in Telegram
# /start → Help menu
# /status → System status
# /customers → List shops
# /revenue → Daily revenue
# /health → Health scores
# /topshops → Top performers

# 5. Create a test shop (trigger new customer alert)
firebase firestore:set shops/test-001 \
  --data '{"name": "E2E Test Shop", "plan": "trial", "status": "active"}'

# 6. Update shop health (trigger churn alert)
firebase firestore:update shops/test-001 \
  --update 'health_score=40'

# 7. Check all alerts arrived in Telegram

# 8. Cleanup
firebase firestore:delete shops/test-001
```

---

## **🐛 Troubleshooting**

### "Bot not responding"

```bash
# 1. Check webhook is set
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo" | jq '.'

# Expected: "url": "https://your-webhook-url"

# 2. Check Firebase emulator is running
firebase emulators:start --only functions

# 3. Check ngrok tunnel is active
ngrok http 5001

# 4. Verify chat ID matches
echo $TELEGRAM_ADMIN_CHAT_ID
```

### "Firestore permission denied"

```bash
# Make sure you're using test data that exists
firebase firestore:get shops/test-shop-001

# If empty, create it first
firebase firestore:set shops/test-shop-001 \
  --data '{"name": "Test", "plan": "trial"}'
```

### "Telegram API error 429: Too Many Requests"

```bash
# You're sending messages too fast
# Add delays between tests
sleep 1
curl ... /status
sleep 1
curl ... /customers
```

---

## **📋 Complete Testing Checklist**

```
[ ] Created test bot with @BotFather
[ ] Got chat ID from @userinfobot
[ ] Set .env.test with credentials
[ ] Started Firebase emulator (firebase emulators:start)
[ ] Ran local command tests (curl to webhook)
[ ] Started ngrok tunnel
[ ] Set Telegram webhook
[ ] Tested /start command in Telegram
[ ] Tested /status command
[ ] Tested /customers command
[ ] Tested /revenue command
[ ] Tested /health command
[ ] Created test shop (new customer alert)
[ ] Updated health score (churn alert)
[ ] Verified all messages in Telegram
[ ] Tested unauthorized access (403 error)
[ ] Performance tested (< 500ms response time)
[ ] Cleaned up test data
[ ] Ready for production deploy!
```

---

## **🚀 When Ready for Production**

Once all tests pass:

```bash
# 1. Deploy to actual Firebase project
firebase deploy --only functions:telegramBotWebhook

# 2. Get production webhook URL from Firebase Console
# → Functions → telegramBotWebhook → Trigger

# 3. Set production webhook
curl -X POST "https://api.telegram.org/bot${PRODUCTION_BOT_TOKEN}/setWebhook" \
  -d "url=https://PRODUCTION_WEBHOOK_URL"

# 4. Test with production bot in Telegram

# 5. Verify in Firebase logs
firebase functions:log
```

---

**✅ Ready to test!**

Next step: Follow Test 1 to get started locally.
