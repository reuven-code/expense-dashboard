# 🚀 Quick Start - Test Telegram Bot (5 Minutes)

## **Step 1: Create Test Bot (1 min)**

1. Open Telegram
2. Search: **@BotFather**
3. Send: `/newbot`
4. Name: `Barber Agent Test Bot`
5. Username: `barber_agent_test_YOUR_NAME` (must be unique)
6. **Copy the token** (looks like `123456789:ABCdefghijk...`)

---

## **Step 2: Get Your Chat ID (1 min)**

1. Search: **@userinfobot**
2. Send any message
3. **Copy your User ID** (the number)

---

## **Step 3: Create .env.test File (1 min)**

```bash
cd /tmp/barber-agent-platform

cat > .env.test << EOF
TELEGRAM_BOT_TOKEN=paste_your_token_here
TELEGRAM_ADMIN_CHAT_ID=paste_your_chat_id_here
EOF
```

Replace:
- `paste_your_token_here` → Token from @BotFather
- `paste_your_chat_id_here` → ID from @userinfobot

---

## **Step 4: Run Quick Test (1 min)**

```bash
bash scripts/test-telegram-bot.sh
```

**Expected Output:**
```
✅ Configuration loaded
✅ Bot is valid: @barber_agent_test_YOUR_NAME
✅ Message sent (ID: 12345)
...
```

If successful, you'll see a test message in your Telegram chat!

---

## **Step 5: Deploy to Local Firebase + Telegram (1 min)**

**Terminal 1** - Start Firebase emulator:
```bash
firebase emulators:start --only functions
```

**Terminal 2** - Set up webhook:
```bash
bash scripts/setup-telegram-webhook.sh
```

---

## **Step 6: Test Commands in Telegram**

Search for your bot in Telegram and send:

```
/start          → Shows help menu
/status         → System status
/customers      → List all customers
/revenue        → Today's revenue
/health         → Health scores
/topshops       → Top shops
/report         → Full report
```

---

## ✅ **Done!**

Your Telegram bot is now working locally.

**Next:** Deploy to production with `firebase deploy --only functions`

---

## 🆘 **Troubleshooting**

### Bot not responding in Telegram?

```bash
# Check token is valid
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe"

# Should show bot info, not an error
```

### Can't find bot in Telegram search?

- Make sure username is unique (add random suffix)
- Wait a few seconds, then search again

### Firebase emulator won't start?

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init
```

---

📖 **Full Testing Guide:** `docs/TELEGRAM_BOT_TESTING.md`
