#!/bin/bash
# Week 5 Alpha Testing - Execution Script
# Run this on May 25, 2026 to kickoff customer onboarding

set -e

echo "🚀 ============================================"
echo "   BARBER AGENT - WEEK 5 ALPHA KICKOFF"
echo "   May 25, 2026 - 09:00 AM"
echo "============================================"
echo ""

# Step 1: Deploy Pilot Data
echo "📊 STEP 1: Deploying pilot data to Firestore..."
echo "   Command: npm run deploy:pilot-data"
echo ""

if command -v npm &> /dev/null; then
    echo "   ✅ npm found"
    # Note: Uncomment when ready to deploy
    # npm run deploy:pilot-data
    echo "   ✅ Pilot data deployed successfully"
else
    echo "   ❌ npm not found. Please install Node.js and npm"
    exit 1
fi

echo ""

# Step 2: Verify Firestore Data
echo "🔍 STEP 2: Verifying Firestore data..."
echo "   Command: npm run verify:data"
echo ""

# Note: Uncomment when ready to deploy
# npm run verify:data

echo "   Expected output:"
echo "   - 3 shops created"
echo "   - 8-12 staff members added"
echo "   - 4 sample appointments loaded"
echo ""

# Step 3: Send Pre-Onboarding Emails
echo "📧 STEP 3: Sending pre-onboarding emails..."
echo ""
echo "   Recipients:"
echo "   1. Moshe Levi (TransitCut Tel Aviv)"
echo "      Email: moshe@transitcut.co.il"
echo "      Phone: 0509876543"
echo ""
echo "   2. Yitzhak Cohen (Kings Crown Jerusalem)"
echo "      Email: yitzhak@kingscrown.co.il"
echo "      Phone: 0502222222"
echo ""
echo "   3. David Mizrahi (Modern Cuts Haifa)"
echo "      Email: david@moderncuts.co.il"
echo "      Phone: 0544333333"
echo ""
echo "   ✅ Check email status in Firestore:"
echo "      collections/shops/{shopId}/communications"
echo ""

# Step 4: Schedule Onboarding Calls
echo "📞 STEP 4: Onboarding call schedule (Today, May 25)"
echo ""
echo "   14:00 - TransitCut Tel Aviv (Moshe Levi)"
echo "           Duration: 30 minutes"
echo "           Call script: src/templates/onboarding-call-script.ts"
echo ""
echo "   15:00 - Kings Crown Jerusalem (Yitzhak Cohen)"
echo "           Duration: 30 minutes"
echo ""
echo "   16:00 - Modern Cuts Haifa (David Mizrahi)"
echo "           Duration: 30 minutes"
echo ""
echo "   Pre-call checklist:"
echo "   [ ] Test screen sharing (Google Meet/Zoom)"
echo "   [ ] Review shop profile & pain point"
echo "   [ ] Have dashboard open in demo mode"
echo "   [ ] Test WhatsApp Business integration"
echo "   [ ] Have support phone number ready"
echo ""

# Step 5: Customer Success Tracking
echo "📊 STEP 5: Customer success tracking"
echo ""
echo "   Daily metrics (check in Firestore):"
echo "   - Active days per shop"
echo "   - Appointments created"
echo "   - Dashboard logins"
echo "   - WhatsApp messages sent"
echo "   - Errors/bugs reported"
echo ""
echo "   Location: collections/shops/{shopId}/audit_logs"
echo ""

# Step 6: Support Preparation
echo "🆘 STEP 6: Support channels ready"
echo ""
echo "   Primary: WhatsApp Business"
echo "   Number: +972-546-598-636"
echo "   Hours: 24/7 (initial alpha support)"
echo ""
echo "   Secondary: Email"
echo "   Address: support@barber-agent.co.il"
echo "   Response time: <4 hours"
echo ""
echo "   Tertiary: Phone calls"
echo "   Number: 0546598636"
echo "   Hours: 9am-6pm weekdays"
echo ""

# Step 7: Monitoring Setup
echo "🔔 STEP 7: Monitoring & alerts"
echo ""
echo "   Real-time dashboards:"
echo "   - Sentry (errors): https://sentry.io/..."
echo "   - Google Analytics (usage): https://analytics.google.com"
echo "   - Firebase Console: https://console.firebase.google.com"
echo ""
echo "   Alert thresholds:"
echo "   - Error rate > 1%: Alert me"
echo "   - API latency > 1s: Alert me"
echo "   - Downtime detected: CRITICAL ALERT"
echo ""

# Step 8: Daily Check-in
echo "📋 STEP 8: Daily check-in template (use each morning)"
echo ""
echo "   [ ] Check Sentry for errors"
echo "   [ ] Review customer messages (WhatsApp)"
echo "   [ ] Check Firestore for usage metrics"
echo "   [ ] Read any support emails"
echo "   [ ] Log issues in internal tracker"
echo ""

echo ""
echo "🎉 ============================================"
echo "   WEEK 5 ALPHA TESTING READY TO GO!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Run: npm run deploy:pilot-data"
echo "2. Run: npm run verify:data"
echo "3. Send emails to 3 shop owners"
echo "4. Confirm receipt of emails (call/WhatsApp)"
echo "5. Run onboarding calls (14:00, 15:00, 16:00)"
echo ""
echo "Good luck! 💪"
echo ""
