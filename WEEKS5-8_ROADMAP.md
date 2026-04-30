# Barber Agent — Weeks 5-8 Roadmap & Next Steps

**Current Status:** Post-Launch (May 24, 2026) ✅  
**Next Phase:** Alpha Testing & Customer Acquisition (May 25 - Jun 30)  
**Timeline:** 4 weeks intensive growth + testing  

---

## 📊 Project Overview

| Phase | Duration | Customers | Revenue | Focus |
|-------|----------|-----------|---------|-------|
| **Alpha (Week 5-8)** | May 25 - Jun 30 | 3 → 10+ | ₪0 → ₪6K | Onboarding, feedback, fixes |
| **Beta (Jul-Aug)** | Jul 1 - Aug 31 | 10 → 40 | ₪6K → ₪24K | Scaling, marketing, features |
| **Launch (Sep+)** | Sep 1+ | 40 → 120+ | ₪24K → ₪72K+ | Full production, sales |

---

## Week 5: Alpha Launch & Onboarding (May 25-31)

**Objective:** Get 3 pilot shops set up and generating first appointments

### Deliverables
✅ Firestore pilot data (3 shops × staff, hours, sample appointments)  
✅ Onboarding email campaign (Day 1, Day 3, Week 1, Week 2)  
✅ Cloud Functions setup (automated email triggers, health scoring)  
✅ Support runbook & escalation procedures  
✅ Week 5 execution dashboard (daily checklist + tracking)  

### Key Activities
- **May 25:** Pilot data setup, send pre-onboarding emails
- **May 26:** Day 1 onboarding calls (45 min each with 3 shops)
- **May 27-30:** Day 3 follow-up, monitor usage, fix issues
- **May 31:** Week 1 pulse survey & NPS collection

### Success Metrics
- 3/3 shops onboarded ✅
- 10+ test appointments created ✅
- NPS ≥ 4.0 (target) ⏳
- 0 critical bugs ✅
- 2/3 shops active ✅

---

## Week 6: Feedback Loop & First Iterations (Jun 1-7)

**Objective:** Collect feedback, fix issues, prepare next 3 customers

### Activities
1. **Feedback Processing**
   - Compile Week 1 learnings from all 3 shops
   - Categorize issues: bugs (P1/P2), feature requests (P3)
   - Identify common pain points

2. **Bug Fixes & Quick Wins**
   - Fix any P1/P2 issues found in Week 5
   - Deploy updated version to pilot shops
   - Test with real data

3. **Feature Roadmap**
   - Prioritize top 3 feature requests
   - Plan Weeks 7-8 development sprints

4. **Customer Success**
   - 1:1 calls with struggling shops
   - Share tips & best practices with high performers
   - Schedule Week 2 business reviews

### Deliverables
- Week 5 Learnings document
- Bug fix log + deployment
- Customer success call notes
- Feature prioritization matrix

### Metrics
- Issue resolution rate: 80%+
- Customer satisfaction: Maintained/improved
- Feature request processing: 100%

---

## Week 7: Feature Development & Next Cohort (Jun 8-14)

**Objective:** Ship 1-2 high-impact features, start recruiting next cohort

### Development Sprint
**High Priority (Do First):**
- [ ] SMS reminders (24h + 1h before) — requested by 2/3 shops
- [ ] Advanced reports (daily/weekly/monthly) — requested by 1/3 shops
- [ ] Staff availability calendar — UX improvement

**Medium Priority (If Time):**
- [ ] Customer feedback surveys (post-appointment)
- [ ] Waitlist management improvements
- [ ] Business intelligence dashboard

### Customer Acquisition
- [ ] Recruit 3 new shops for Beta cohort (Jul 1)
- [ ] Create case study from TransitCut
- [ ] Launch referral rewards program
- [ ] Reach out to 10 prospective customers

### Deliverables
- 1-2 new features deployed
- 3 new Beta customers signed up
- Case study published on website
- Referral program live

### Success Metrics
- Features deployed & tested ✅
- NPS improved to 5.0+ ⏳
- 3+ new customers in pipeline ⏳

---

## Week 8: Scale & Stability (Jun 15-30)

**Objective:** Stabilize platform, onboard next cohort, prepare for Beta

### Activities
1. **Performance Optimization**
   - Load testing (50+ concurrent users)
   - Database query optimization
   - API latency reduction

2. **Stability & Monitoring**
   - Increase logging/observability
   - Set up automated alerts
   - Weekly deployment + rollback readiness

3. **Customer Expansion**
   - Onboard 3 Beta customers (cohort 2)
   - Maintain support for 3 Alpha customers
   - Referral tracking & rewards

4. **Business Metrics**
   - Analyze MRR, churn, NPS trends
   - Plan pricing adjustments (if needed)
   - Update financial forecasts

### Deliverables
- Performance report (benchmarks met)
- 3 new Beta customers onboarded
- Health scoring dashboard live
- Jun 30 business review

### Metrics
- Uptime: 99.5%+
- API latency: p95 < 300ms
- Churn rate: < 10%
- NPS: 5.0+

---

## Cohort Timeline

### Cohort 1: Alpha (May 25+)
- **Shops:** TransitCut, Kings Crown, Modern Cuts
- **Status:** Active, gathering feedback
- **Trial ends:** Jun 24 (14-day trial → ₪600/month option)
- **Renewal target:** 2/3 renew

### Cohort 2: Beta (Jul 1+)
- **Target:** 3 new shops
- **Acquisition:** Referrals, cold outreach, partnerships
- **Support:** Hands-on (white-glove service)
- **Trial:** 14 days, then ₪600/month

### Cohort 3: Expansion (Aug 1+)
- **Target:** 5-7 shops
- **Acquisition:** Content marketing, word-of-mouth
- **Support:** Standard

---

## Feature Roadmap

### High Priority (Weeks 6-8)
```
SMS Reminders
├─ 24h before appointment
├─ 1h before appointment
├─ Customizable templates
└─ Delivery tracking

Advanced Reports
├─ Daily summary (appointments, revenue)
├─ Weekly metrics (no-show rate, peak hours)
├─ Monthly insights (growth, trends)
└─ Export to PDF/CSV

Staff Availability Calendar
├─ Visual calendar per staff
├─ Drag-to-assign appointments
├─ Conflict detection
└─ Time-off management
```

### Medium Priority (Jul-Aug)
```
Customer Feedback
├─ Post-appointment survey
├─ NPS tracking per customer
├─ Feedback sentiment analysis
└─ Action items from feedback

Waitlist Improvements
├─ Auto-promotion when slot opens
├─ Customer notification
├─ Preferred time tracking
└─ Cancellation management

Mobile App (Lite)
├─ View appointments
├─ Receive reminders
├─ Cancel/reschedule
└─ Store location/hours
```

### Lower Priority (Sep+)
```
Payment Processing
├─ Stripe/Paypal integration
├─ Online deposits
├─ Invoice generation

API Access
├─ Partner integrations
├─ Custom webhooks
├─ Rate limiting per tier

White-Label
├─ Custom domain
├─ Branded emails
├─ Logo/colors
```

---

## Customer Success Plan

### Week 5-6: Activation Phase
- [ ] Day 1 onboarding call (1 hour)
- [ ] Day 3 tip email
- [ ] Day 7 pulse survey
- [ ] Troubleshooting as needed

### Week 7-8: Growth Phase
- [ ] Weekly check-in (optional)
- [ ] Feature update calls
- [ ] Success milestone celebrations
- [ ] Upsell opportunities identified

### Ongoing (Monthly)
- [ ] Business review call (30 min)
- [ ] Health score analysis
- [ ] Feature roadmap preview
- [ ] Renewal discussion (before expiry)

---

## Financial Projections (Weeks 5-8)

### Revenue Forecast

```
Week 5 (May 25):
- Customers: 3 (trial)
- MRR: ₪0 (trial period)

Week 6 (Jun 1):
- Customers: 3-4 (if 1 converts early)
- MRR: ₪600

Week 7 (Jun 8):
- Customers: 6 (3 Alpha + 3 Beta)
- MRR: ₪3,600

Week 8 (Jun 15-30):
- Customers: 9 (3 Alpha + 3 Beta + 3 expanding)
- MRR: ₪5,400

Month End (Jun 30):
- Customers: 10
- MRR: ₪6,000
- ARR Trajectory: ₪72,000 (on track for ₪288K Year 1)
```

### Cost Breakdown (Monthly)

```
Infrastructure:
- Firebase/Firestore: ₪300
- Cloud Functions: ₪200
- SendGrid/Email: ₪100
- Monitoring/Sentry: ₪50
Total: ₪650/month

Development (Solo):
- Salary: ₪8,000/month (post-launch maintenance)
- Contractor support (as needed): ₪1,000-3,000

Total Cost: ₪9,650-11,650/month
```

### Unit Economics

```
Price per customer: ₪600/month
Cost of acquisition: ₪500 (marketing, support)
CAC payback period: 1 month
LTV (assuming 12 months): ₪7,200
LTV:CAC ratio: 14.4x (excellent)
```

---

## Risk Mitigation

### Key Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Customer churn** | Medium | High | Weekly engagement, excellent support |
| **Bugs/downtime** | Medium | High | Thorough testing, monitoring, backups |
| **Feature requests not met** | High | Medium | Transparent roadmap, manage expectations |
| **Slow adoption** | Medium | High | Free consultations, case studies, referrals |
| **Competitive entry** | Low | Medium | Move fast, lock in customers early |

### Red Flags to Watch

- [ ] <50% of Cohort 1 renewing after trial
- [ ] NPS <3.5
- [ ] Churn rate >15%/month
- [ ] >1 P1 bug per week
- [ ] No new inbound leads by Jul 15

---

## Team & Support

### Owner: Reuven Yaya
- Full-stack development
- Customer success
- Product decisions

### Support Channels
- **WhatsApp:** Direct messages (priority)
- **Email:** Daily digest
- **Phone:** Scheduled calls only
- **In-app:** Help widget + documentation

### On-Call Protocol
- **Weekdays:** 9am-6pm (live support)
- **Evenings/Weekends:** Async (respond within 24h)
- **Critical issues:** 24/7 response

---

## Success Definition (End of Week 8)

### Hard Metrics
- ✅ 10 customers signed up
- ✅ 6-7 customers renewed after trial
- ✅ ₪5,400+ MRR
- ✅ 99%+ uptime
- ✅ <3 critical bugs/month

### Soft Metrics
- ✅ NPS 5.0+
- ✅ 2+ case studies/testimonials
- ✅ 5+ inbound leads/month
- ✅ Team morale high
- ✅ Product-market fit signals

---

## Transition to Beta (Jul 1)

If Week 5-8 metrics hit:
1. ✅ Expand support team (hire VA for customer success)
2. ✅ Increase marketing budget (₪3K/month)
3. ✅ Plan Cohort 3 acquisition (Aug 1)
4. ✅ Roadmap feature development (Q3 2026)
5. ✅ Explore partnership opportunities

If metrics miss:
1. ⚠️ Analyze why (feedback, features, pricing?)
2. ⚠️ Pivot feature roadmap
3. ⚠️ Increase support hours
4. ⚠️ Slow down expansion, focus on retention

---

## Files to Reference

📄 **Week 5 Dashboard:** WEEK5_DASHBOARD.md (daily execution checklist)  
📄 **Onboarding Templates:** ~/.hermes/barber-agent-onboarding-templates.md  
📄 **Alpha Testing Plan:** ~/.hermes/barber-agent-alpha-testing.md  
📄 **Quick Reference:** ~/.hermes/barber-agent-quick-reference.md  
📄 **ROI Metrics:** ~/.hermes/barber-agent-roi-metrics.md  

---

## Next Actions (Today)

- [ ] Read WEEK5_DASHBOARD.md carefully
- [ ] Set up pilot data (npx ts-node scripts/setup-pilot-data.ts)
- [ ] Deploy Cloud Functions (email triggers)
- [ ] Send pre-onboarding emails
- [ ] Schedule onboarding calls (May 26)
- [ ] Create shared tracking spreadsheet (for yourself)

---

✅ **Weeks 5-8 Roadmap Complete**  
**Status:** Ready to launch alpha testing May 25, 2026  
**Next milestone:** Jun 30 (10 customers, ₪5.4K MRR)  

בהצלחה! 🚀
