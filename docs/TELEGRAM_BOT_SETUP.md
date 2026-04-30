# Telegram Bot Setup Guide for Barber Agent

**Purpose:** Real-time monitoring, alerts, and admin commands via Telegram  
**Status:** Ready to deploy  

---

## 🤖 **Step 1: Create Telegram Bot**

### 1.1 Create Bot with BotFather

1. Open Telegram
2. Search for **@BotFather**
3. Send `/newbot`
4. Follow prompts:
   - Bot name: `Barber Agent Admin Bot`
   - Username: `barber_agent_admin_bot` (or similar)
5. Copy the **API Token** (looks like `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh`)

### 1.2 Get Your Chat ID

1. Search for **@userinfobot**
2. Send any message
3. Bot replies with your User ID (e.g., `123456789`)
4. This is your `TELEGRAM_ADMIN_CHAT_ID`

---

## 🔧 **Step 2: Configure Environment**

### Add to `.env.production`:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_chat_id_here
```

### Update `functions/.env.production`:

```bash
# Same as above (Cloud Functions need it too)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_chat_id_here
```

---

## 📤 **Step 3: Deploy Telegram Bot**

### Deploy to Google Cloud Functions:

```bash
# Deploy telegram bot webhook
firebase deploy --only functions:telegramBotWebhook

# Deploy daily report job
firebase deploy --only functions:dailyReportJob

# Deploy all alerts
firebase deploy --only functions:newCustomerAlert,churnRiskAlert,errorAlert
```

### Set Webhook URL:

```bash
# After deployment, get the function URL from Firebase Console
# Then run:

curl -X POST https://api.telegram.org/botYOUR_TOKEN/setWebhook \
  -d "url=https://YOUR_CLOUD_FUNCTION_URL"

# Or use this script:
bash scripts/setup-telegram-webhook.sh
```

---

## 💬 **Step 4: Test the Bot**

### 1. Add bot to your Telegram (as admin)

- Search for `@barber_agent_admin_bot` (or your bot name)
- Click **Start**

### 2. Test commands:

```
/start         → Shows help menu
/status        → System status
/customers     → List all customers
/revenue       → Today's revenue
/health        → Customer health scores
/topshops      → Top 5 performing shops
/report        → Full daily report
```

### 3. Watch for alerts:

- 🎉 New customer signup
- 🚨 Churn risk detected
- ❌ Critical errors
- 💬 WhatsApp messages

---

## 📊 **Daily Reports (Automated)**

**Time:** 6 AM Israel time (every day)  
**Content:**
- Active shops count
- Daily revenue
- Appointments yesterday
- Shop-by-shop breakdown
- Health scores
- Critical alerts

**Example:**
```
📊 Daily Report
Monday, January 1st, 2026

📈 Quick Stats
🏪 Active Shops: 10
💰 Daily Revenue: ₪200
📅 Appointments: 45

🏪 Shop Breakdown
• TransitCut Tel Aviv: 15 appts 🟢 95/100
• Kings Crown Jerusalem: 12 appts 🟡 65/100
• Modern Cuts Haifa: 18 appts 🟢 88/100
...

⚠️ Alerts
✅ No critical alerts
```

---

## 🔔 **Real-Time Alerts**

### Alert Types:

| Alert | Trigger | Action |
|-------|---------|--------|
| 🎉 New Customer | Shop created | Send welcome message |
| 🚨 Churn Risk | Health score drops 25+ | Alert for immediate support |
| ❌ Critical Error | Error with severity='critical' | Alert + check Sentry |
| 💬 WhatsApp Message | Inbound customer message | Forward to admin |

---

## 🎮 **Admin Commands**

### `/status`
Shows:
- System uptime
- Error rate
- Last error timestamp
- Database health
- API response times

### `/customers`
Lists all active customers with:
- Shop name & location
- Plan (trial/paid)
- Health score
- Owner contact

### `/revenue`
Shows:
- Estimated daily revenue
- Paid vs trial customers
- MRR (monthly recurring revenue)
- Progress to break-even

### `/health`
Ranks customers by health score:
- 🟢 Green (75+): Healthy
- 🟡 Yellow (50-74): At risk
- 🔴 Red (<50): Critical

### `/topshops`
Top 5 performing shops by:
- Total appointments
- Health score
- Engagement level

### `/report`
Generates full daily report immediately (doesn't wait for 6 AM)

---

## 🔐 **Security**

### Protect Your Bot:

1. **Check sender:** Only accept messages from your chat ID
2. **Validate token:** Use environment variables (never hardcode)
3. **Rate limit:** Limit command frequency (coming soon)
4. **Audit logging:** Log all admin commands to Firestore

### Current Implementation:

```typescript
// Verify sender is admin
if (chatId.toString() !== TELEGRAM_CHAT_ID) {
  await sendTelegramMessage('❌ Unauthorized access', chatId);
  return res.sendStatus(403);
}
```

---

## 📈 **Example: Monitor Week 5 Alpha Testing**

### 6 AM (Daily Report)
```
📊 Barber Agent Daily Report
Tuesday, May 26, 2026

📈 Quick Stats
🏪 Active Shops: 3
💰 Daily Revenue: ₪0 (trial)
📅 Appointments: 8

🏪 Shop Breakdown
• TransitCut Tel Aviv: 3 appts 🟢 92/100
• Kings Crown Jerusalem: 2 appts 🟡 65/100
• Modern Cuts Haifa: 3 appts 🟢 88/100

⚠️ Alerts
✅ No critical alerts
```

### Throughout Day (Real-time Alerts)
```
🎉 New Customer!
Shop: TransitCut Tel Aviv
Plan: 🆓 Free Trial (14 days)
Created: 09:15

[Later]

⚠️ Churn Risk Alert!
Shop: Kings Crown Jerusalem
Health Score: 85 → 60
Status: 🟡 AT RISK

[Later]

💬 New WhatsApp Message
From: 0509876543
Shop: TransitCut Tel Aviv
Message: "אתה עדיין פתוח?"
Time: 14:30
```

### On Demand
```
/status
✅ System Status

Infrastructure:
• Uptime: 99.5%
• Error Rate: 0.1%
• Last Error: 2h ago

Database:
• Shops: 3
• Firestore Status: 🟢 Healthy
...
```

---

## 🚀 **Deployment Checklist**

```bash
[ ] Create bot with @BotFather (save token)
[ ] Get chat ID from @userinfobot (save ID)
[ ] Add tokens to .env.production
[ ] Deploy: firebase deploy --only functions
[ ] Set webhook: curl ... /setWebhook
[ ] Add bot to Telegram (search by username)
[ ] Send /start to bot
[ ] Test /status command
[ ] Wait for 6 AM for first daily report
[ ] Verify alerts trigger (create test shop)
```

---

## 🐛 **Troubleshooting**

### Bot doesn't respond

**Solution:**
1. Check token in `.env.production`
2. Check chat ID matches `TELEGRAM_ADMIN_CHAT_ID`
3. Run: `firebase functions:log` to see errors
4. Reset webhook: Run setup script again

### No daily report at 6 AM

**Solution:**
1. Check timezone: Should be `Asia/Jerusalem`
2. Check Cloud Scheduler is running: `gcloud scheduler jobs list`
3. Check Firestore has data (active shops)
4. Manually test: Run `/report` command

### Alerts not sending

**Solution:**
1. Check Firestore triggers are deployed
2. Check error logs: `firebase functions:log`
3. Verify Firestore data structure matches code
4. Test manually by creating Firestore document

---

## 📞 **Support**

Need help? Check:
1. `functions/src/telegram-bot.ts` — Code comments
2. `firebase functions:log` — Error logs
3. `https://core.telegram.org/bots/api` — Telegram Bot API docs

---

✅ **Ready to Deploy!**

Next step: `firebase deploy --only functions`
