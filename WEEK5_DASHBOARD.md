# Week 5 Alpha Testing Dashboard — Execution & Tracking

**Period:** May 25 - May 31, 2026  
**Objective:** Onboard 3 pilot barbershops, achieve initial product-market fit, collect actionable feedback  
**Owner:** Reuven Yaya  

---

## 🎯 Week 5 Goals

| Goal | Metric | Target | Status |
|------|--------|--------|--------|
| **Onboarding** | 3/3 shops set up | 100% | ⏳ In Progress |
| **Activation** | Active users in dashboard | 3/3 | ⏳ In Progress |
| **Usage** | Appointments created | 10+ | ⏳ Pending |
| **Satisfaction** | Day 7 NPS (informal) | 4.0+ | ⏳ Pending |
| **Bugs** | Critical issues | 0 | ✅ Baseline |

---

## Daily Execution Checklist

### **Day 1: Monday, May 25**

**Morning (9:00-10:00)**
- [ ] Run pilot data setup script
  ```bash
  npx ts-node scripts/setup-pilot-data.ts
  ```
- [ ] Verify Firestore data loaded (3 shops, staff, sample appointments)
- [ ] Test admin dashboard access for each pilot shop
- [ ] Confirm WhatsApp integration connected

**Midday (10:00-12:00)**
- [ ] Send pre-onboarding email to all 3 shop owners
- [ ] Call David Levi (TransitCut Tel Aviv) — confirm email received
- [ ] Call Yosef Bergman (Kings Crown Jerusalem) — confirm email received
- [ ] Call Nadia Saleh (Modern Cuts Haifa) — confirm email received

**Afternoon (14:00-16:00)**
- [ ] Schedule Day 1 onboarding calls (each 45-60 min)
  - TransitCut: 15:00
  - Kings Crown: 16:00
  - Modern Cuts: 17:00 (next day if needed)
- [ ] Prepare onboarding script & demo walkthrough
- [ ] Test all features work in demo environment

**Checklist Item:**
```markdown
✅ Pre-onboarding emails sent (3/3)
- [ ] David Levi (transitcut) received & confirmed
- [ ] Yosef Bergman (kingscrown) received & confirmed
- [ ] Nadia Saleh (moderncuts) received & confirmed
```

---

### **Day 2: Tuesday, May 26** (Day 1 Onboarding)

**Morning Prep (9:00-10:00)**
- [ ] Review shop profiles (focus areas, pain points)
- [ ] Prepare demo environment (live API, real WhatsApp numbers)
- [ ] Test screen sharing & remote access tools

**Onboarding Calls (10:00-14:00)**
```
Schedule (45-60 min each):
- 10:00-11:00: TransitCut Tel Aviv (David Levi)
- 11:30-12:30: Kings Crown Jerusalem (Yosef Bergman)
- 13:00-14:00: Modern Cuts Haifa (Nadia Saleh) [if not done]
```

**Onboarding Script (per call):**
1. Welcome & context (5 min)
   - "Thanks for joining Barber Agent alpha"
   - Explain 4-week trial, feedback importance
2. Demo dashboard (15 min)
   - Show appointments list
   - Demo staff management
   - Walk through business hours setup
3. Hands-on setup (25 min)
   - Help customer add their staff
   - Verify WhatsApp configuration
   - Test sending a test appointment
4. Q&A & support (10 min)
   - Answer questions
   - Set up direct support channel (WhatsApp)
5. Next steps (5 min)
   - Send summary email post-call
   - Give link to video tutorial
   - Confirm contact for questions

**Post-Call Actions:**
- [ ] Send Day 1 confirmation email to all attendees
- [ ] Document any setup issues or feature requests
- [ ] Update shop profile with customizations made

---

### **Day 3: Wednesday, May 27** (Day 3 Follow-up)

**Morning (9:00-10:00)**
- [ ] Check Firestore for any appointment activity
- [ ] Review error logs for issues
- [ ] Prepare Day 3 tip email

**Afternoon (14:00-16:00)**
- [ ] Send "Day 3 tip" email to all 3 shops
- [ ] WhatsApp check-in with each owner
  - "How's it going? Any questions?"
- [ ] Monitor WhatsApp messages for responses

**Tracking:**
```markdown
Day 3 Email Status:
- [ ] TransitCut received & opened
- [ ] Kings Crown received & opened
- [ ] Modern Cuts received & opened

Day 3 WhatsApp Check-ins:
- [ ] David Levi response
- [ ] Yosef Bergman response
- [ ] Nadia Saleh response
```

---

### **Day 7: Sunday, May 31** (Week 1 Review)

**Morning (9:00-11:00)**
- [ ] Generate Week 1 analytics report
  ```
  Metrics to check:
  - Active days: X days each shop used system
  - Appointments created: Total X
  - Appointments completed: Total X
  - No-shows: Total X
  - WhatsApp messages sent: Total X
  - Admin page views: Total X
  ```
- [ ] Check for any errors or crashes (Sentry)
- [ ] Compile feedback from all 3 shops

**Midday (11:00-14:00)**
- [ ] Send Week 1 NPS survey (informal)
  - 3 quick questions (40 seconds)
  - Via WhatsApp or email
- [ ] Request feedback & feature requests
- [ ] Compile results in spreadsheet

**Afternoon (14:00-16:00)**
- [ ] Weekly review call (optional, if time)
  - Ask about Week 2 expectations
  - Discuss any issues found
- [ ] Document learnings:
  - What worked?
  - What didn't?
  - What to improve?

**Week 1 Report Template:**
```markdown
# TransitCut Week 1 Report

**Owner:** David Levi  
**Contact:** 0509876543  

**Usage Metrics:**
- Days active: X/7
- Appointments created: X
- Appointments completed: X
- No-shows: X
- Dashboard logins: X

**Feedback:**
- NPS Score: X/10
- Feature requests: [list]
- Bugs found: [list]
- What they loved: [list]

**Next Week Plans:**
- Focus on: [area]
- Goals: [specific metrics]
```

---

## 📊 Key Metrics Dashboard

### Real-Time Tracking (Update Daily)

| Shop | Status | Setup | Active | Appts Created | NPS | Risk |
|------|--------|-------|--------|--------------|-----|------|
| **TransitCut** | 🟡 | ✅ Day 1 | ✅ | 0 | TBD | LOW |
| **Kings Crown** | 🟡 | ✅ Day 1 | ✅ | 0 | TBD | MED |
| **Modern Cuts** | 🟡 | ⏳ Pending | ❌ | 0 | TBD | HIGH |

**Legend:**
- 🟡 = In Progress
- ✅ = Complete
- ❌ = Not Started
- 🔴 = At Risk

### Success Criteria (End of Week 5)

```markdown
✅ SETUP (Weighted: 30%)
  [ ] 3/3 shops onboarded (account created)
  [ ] 3/3 shops have staff added
  [ ] 3/3 shops have business hours configured
  Target: 100%

✅ ACTIVATION (Weighted: 30%)
  [ ] 3/3 shops created at least 1 test appointment
  [ ] 3/3 received at least 1 appointment from customer
  [ ] 2/3 shops renewed WhatsApp integration
  Target: 66%+

✅ USAGE (Weighted: 20%)
  [ ] 10+ total appointments created across 3 shops
  [ ] 5+ customer WhatsApp messages
  [ ] 3+ dashboard logins per shop average
  Target: All hit

✅ SATISFACTION (Weighted: 15%)
  [ ] Average NPS ≥ 4.0/10 (scale: -5 to +10)
  [ ] 0 critical bugs reported
  [ ] 2/3 willing to renew after trial
  Target: All hit

✅ RETENTION (Weighted: 5%)
  [ ] 0 shops churned
  [ ] 3/3 shops scheduled Week 2 follow-up
  Target: 100%
```

---

## 🚨 Risk Mitigation & Escalation

### Critical Issues (P1 - Escalate Immediately)

| Issue | Mitigation | Escalation |
|-------|-----------|------------|
| **Login failure** | Test account before call | Fix within 2 hours |
| **WhatsApp disconnected** | Reconnect during call | Use manual SMS until fixed |
| **Dashboard crash** | Reload page / restart | Alert: Check logs in Sentry |
| **Data loss** | Verify backups | Restore from backup |

### High Priority (P2 - Fix Within 24 Hours)

| Issue | Example | Action |
|-------|---------|--------|
| **Feature not working** | Staff assignment not saving | Test, debug, deploy fix |
| **Slow performance** | Page takes >5 seconds | Profile, optimize queries |
| **Confusing UX** | Can't find business hours button | Add tooltip or redesign |

### Medium Priority (P3 - Collect & Plan)

| Issue | Example | Action |
|-------|---------|--------|
| **Feature request** | "Want SMS, not just WhatsApp" | Log, prioritize for roadmap |
| **Minor bug** | Timestamp shows wrong timezone | Add to sprint planning |

---

## 📞 Support Protocol

### Channels
1. **WhatsApp:** Direct message (fastest response)
2. **Email:** Weekly digest
3. **Phone:** Scheduled calls only
4. **Dashboard:** In-app help widget

### Response Times
- **Critical (P1):** 30 min response, 2 hour resolution
- **High (P2):** 4 hour response, 24 hour resolution
- **Medium (P3):** 24 hour response, backlog

### Example Support Interactions

```
Customer: "Customers can't book through WhatsApp"
Action: 
  1. Ask for screenshot (2 min)
  2. Test live (5 min)
  3. Check logs (5 min)
  4. Find issue (debug) or escalate
  5. Provide workaround if needed (2 min)
  Total: 15 min response
```

---

## 📝 Feedback Collection Methods

### Method 1: Day 7 Pulse Survey (WhatsApp)
```
Message (Hebrew):
"שלום! 🎯 עברנו שבוע אחד! 
הסקר של 40 שניות:
1. מכמה עד 10 - כמה סביבון Barber Agent עוזר לך?
2. מה היה הכי שימושי?
3. מה חסר בשבילך?

תודה! 💙"
```

### Method 2: Week 1 NPS Survey (Email)
```
Subject: "כיצד אנחנו עומדים?"

Question 1: "בקנה מידה 1-10, כמה סביבון אתה מוסיף?
           (-5 = אקסטראורדינרי, +10 = מושלם)"

Question 2: "מה הצליח הכי טוב?"

Question 3: "מה אנחנו יכולים לשפר?"
```

### Method 3: Ongoing Feedback (WhatsApp)
```
Reactive: Listen to messages in WhatsApp group
Proactive: "How's [feature] working for you?"
```

---

## 🎯 Success Outcomes

### Best Case (All metrics hit)
- ✅ 3/3 shops active & using system
- ✅ 10+ appointments created
- ✅ NPS 5.0+
- ✅ 2/3 wanting to scale to Month 2
- **Result:** Proceed to Week 6 with confidence

### Moderate Case (70% metrics hit)
- ✅ 3/3 shops onboarded
- ✅ 5-9 appointments created
- ✅ NPS 3.5-4.9
- ✅ 1-2 shops wanting to scale
- **Action:** Fix top 2 issues, continue with caution

### Worst Case (< 50% metrics hit)
- ⚠️ 2/3 shops active
- ⚠️ <5 appointments created
- ⚠️ NPS <3.5
- ⚠️ 0-1 shops renewing
- **Action:** Pause, debug, iterate, retest

---

## 📋 Daily Standup Template

**Use this every morning to stay on track:**

```
Date: [DATE]
Owner: Reuven

✅ Completed Yesterday:
  - [Item 1]
  - [Item 2]

⏳ In Progress Today:
  - [Item 1]
  - [Item 2]

🚨 Blockers:
  - [Issue 1]

📊 Metrics:
  - Shops active: X/3
  - Appointments: X total
  - NPS: X avg
```

---

## 📞 Quick Reference Numbers

| Person | Shop | Role | Phone | Email | Status |
|--------|------|------|-------|-------|--------|
| David Levi | TransitCut Tel Aviv | Owner | 0509876543 | david@transitcut.co.il | 🟡 |
| Yosef Bergman | Kings Crown Jerusalem | Owner | 0502222222 | yosef@kingscrown.co.il | 🟡 |
| Nadia Saleh | Modern Cuts Haifa | Owner | 0544333333 | nadia@moderncuts.co.il | 🟡 |

---

## ✨ Post-Week 5 Actions

### If Successful (All 3 shops active)
1. Schedule Week 2 feature updates call
2. Plan Week 6-8 roadmap based on feedback
3. Start recruitment for next cohort (3 more shops)
4. Document case studies & testimonials

### If Partial Success (2/3 shops active)
1. Debug issues with Shop #3
2. Schedule 1:1 calls with struggling shops
3. Offer hands-on support/customization
4. Decide: Continue or pivot

### If Unsuccessful (1/3 or 0/3 active)
1. Post-mortem: What went wrong?
2. Fix critical issues
3. Reach out to shops with fix
4. Plan Week 6 retry with same shops

---

✅ **Week 5 Dashboard Ready**  
**Last Updated:** May 24, 2026  
**Next Update:** May 25, 2026 (Daily)
