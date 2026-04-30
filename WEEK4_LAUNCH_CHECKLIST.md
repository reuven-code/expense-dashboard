# Week 4 Launch Readiness — Production Deployment Checklist

**Project:** Barber Agent SaaS Platform  
**Target Launch Date:** May 24, 2026  
**Status:** ✅ Week 4 Security & Testing Complete

---

## Pre-Launch Verification (48 Hours Before Go-Live)

### Code Quality ✅
- [ ] **TypeScript Compilation**
  ```bash
  npm run build  # Both backend & frontend
  # Expected: 0 errors, 0 warnings
  ```
- [ ] **Linting Passes**
  ```bash
  npm run lint
  # Expected: All files pass ESLint
  ```
- [ ] **All Tests Pass**
  ```bash
  npm test
  # Expected: 100% pass rate, no timeout failures
  ```
- [ ] **No Hardcoded Secrets**
  ```bash
  npm run security:check  # Custom script to scan for secrets
  ```
- [ ] **Dependency Vulnerabilities**
  ```bash
  npm audit
  # Expected: 0 critical, 0 high vulnerabilities
  ```

### Backend Verification ✅
- [ ] **Environment Variables Configured**
  ```bash
  # Verify all in .env.production:
  GEMINI_API_KEY ✓
  WHATSAPP_API_KEY ✓
  WHATSAPP_PHONE_NUMBER_ID ✓
  FIREBASE_PROJECT_ID ✓
  JWT_SECRET ✓
  ```
- [ ] **Database Migrations Complete**
  ```bash
  npm run db:migrate:production
  # Expected: All migrations applied successfully
  ```
- [ ] **Firestore Security Rules Deployed**
  ```bash
  firebase deploy --only firestore:rules
  # Verify rules validate properly:
  # - User-scoped access enforced
  # - Role-based permissions working
  # - Audit logging enabled
  ```
- [ ] **API Endpoints Tested**
  ```bash
  npm run test:e2e
  # Expected: All 25+ E2E tests pass in < 30 seconds
  ```
- [ ] **Performance Baseline**
  - Appointment list: < 200ms
  - Availability check: < 100ms
  - Staff operations: < 150ms
  - P95 latency acceptable

### Frontend Verification ✅
- [ ] **Production Build Optimized**
  ```bash
  cd admin && npm run build
  # Expected: Bundle size < 85KB gzipped
  ```
- [ ] **No Console Errors**
  - No unhandled promise rejections
  - No missing translations (all keys present)
  - No memory leaks (DevTools heap)
- [ ] **All Pages Render**
  - [ ] Appointments page loads
  - [ ] Staff management loads
  - [ ] Business hours loads
  - [ ] Language toggle works (en/he)
- [ ] **Forms Validated**
  - [ ] Appointment creation form validates
  - [ ] Staff form validates phone/email
  - [ ] Hours form saves without errors
- [ ] **Accessibility Verified**
  ```bash
  npm run test:a11y
  # Expected: 0 critical WCAG violations
  ```

### Security Verification ✅
- [ ] **HTTPS Enforced**
  - SSL certificate installed (Let's Encrypt)
  - HSTS header present (Strict-Transport-Security)
  - No mixed content warnings
- [ ] **Security Headers Present**
  ```bash
  curl -I https://barber-agent.vercel.app
  # Expected headers:
  # - Content-Security-Policy: ✓
  # - X-Frame-Options: DENY ✓
  # - X-Content-Type-Options: nosniff ✓
  # - Referrer-Policy: strict-origin-when-cross-origin ✓
  ```
- [ ] **CORS Properly Configured**
  - Only frontend domain allowed
  - No wildcard (*) origin
  - Credentials mode correct
- [ ] **Rate Limiting Active**
  ```bash
  # Test rate limits:
  for i in {1..15}; do curl -s https://api.barber-agent.co.il/appointments; done
  # Expected: 429 (Too Many Requests) after 10 requests
  ```
- [ ] **Secrets Rotated**
  - JWT secret changed from dev
  - Gemini API key from production project
  - WhatsApp API key from production account
  - Firebase service account key in GCP Secret Manager

### Infrastructure ✅
- [ ] **Backend Deployed & Live**
  ```bash
  curl https://api.barber-agent.co.il/health
  # Expected: 200 OK with timestamp
  ```
- [ ] **Frontend Deployed & Live**
  ```bash
  curl https://barber-agent.vercel.app
  # Expected: 200 OK, HTML response
  ```
- [ ] **Database Backups Configured**
  - [ ] Daily Firestore backups enabled
  - [ ] Backup retention: 30 days
  - [ ] Restore procedure tested
- [ ] **Monitoring Configured**
  - [ ] Sentry error tracking enabled
  - [ ] Google Analytics running
  - [ ] Uptime monitoring (e.g., UptimeRobot)
  - [ ] Alert thresholds set

### Documentation ✅
- [ ] **README Updated**
  - Project overview
  - Tech stack
  - Deployment instructions
  - Contributing guidelines
- [ ] **API Documentation**
  - OpenAPI/Swagger specs
  - Example requests/responses
  - Error codes explained
- [ ] **Security Documentation**
  - Incident response procedure
  - On-call runbook
  - Security contact info
- [ ] **User Onboarding**
  - Admin dashboard tour created
  - Help documentation written
  - FAQ compiled

### Business Readiness ✅
- [ ] **Payment Processing Tested**
  ```bash
  # Test payment flow (if applicable):
  # 1. Create test appointment with premium service
  # 2. Process payment via Stripe/Paypal
  # 3. Verify webhook handling
  # 4. Check refund procedure
  ```
- [ ] **Customer Support Ready**
  - [ ] Support email configured
  - [ ] Response templates created
  - [ ] Issue tracking system set up
- [ ] **Terms & Privacy**
  - [ ] Terms of Service published
  - [ ] Privacy Policy (Hebrew + English)
  - [ ] GDPR/DPA compliance statement
- [ ] **Legal Review Complete**
  - [ ] Lawyer reviewed T&C
  - [ ] Data handling compliant with Israeli law

---

## Go-Live Day Checklist

### 4 Hours Before Launch
- [ ] Final smoke tests pass (all 25+ E2E tests)
- [ ] Databases backed up
- [ ] On-call engineer briefed
- [ ] Rollback plan documented & tested
- [ ] Status page prepared (status.barber-agent.co.il)

### 1 Hour Before Launch
- [ ] Product team on Slack #launch-day channel
- [ ] Monitoring dashboards open (Sentry, Analytics)
- [ ] Alert notifications tested
- [ ] Customer support team briefed

### Launch Time (T=0)
```bash
# 1. Deploy backend
gcloud run deploy barber-agent-backend --source .

# 2. Deploy frontend
cd admin && vercel deploy --prod

# 3. Smoke test
curl https://api.barber-agent.co.il/health
curl https://barber-agent.vercel.app

# 4. Announce
# Tweet: "🎉 Barber Agent is LIVE! מערכת התורים החדשה לעסקים שלכם"
```

### T+30 minutes (Post-Launch Check)
- [ ] No spike in error rates
- [ ] API response times normal
- [ ] Frontend page loads < 2.5s
- [ ] No customer complaints in support channel
- [ ] Revenue tracking functional

### T+2 hours
- [ ] Database queries performing normally
- [ ] Disk usage within expected range
- [ ] No memory leaks detected
- [ ] All scheduled jobs running

### T+24 hours (Post-Launch Review)
- [ ] Review error logs for issues
- [ ] Analyze performance metrics
- [ ] Customer feedback compilation
- [ ] Incident review (if any)
- [ ] Deployment success retrospective

---

## 24x7 Monitoring Setup

### Critical Alerts
```yaml
Alerts:
  - API Down: Response time > 1s → Page on-call
  - Error Rate > 1%: → Slack #alerts
  - High Memory: > 80%: → Email + Slack
  - Database Latency > 500ms: → Slack
  - Unauthorized Access Attempts (10+/min): → Page on-call
```

### Dashboard Metrics
- Active users (real-time)
- Appointments created (daily)
- Revenue (daily)
- API latency (p50, p95, p99)
- Error rate (%)
- Uptime (%)

---

## Success Metrics (First Week)

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Uptime | 99.5%+ | < 99% |
| API Latency (p95) | < 500ms | > 1s |
| Error Rate | < 0.1% | > 1% |
| Active Businesses | 5+ | N/A |
| Appointments Created | 50+ | N/A |
| Revenue | ₪3,000+ | N/A |
| Customer NPS | 8+ | < 6 |

---

## Rollback Procedure (If Needed)

### Option 1: Immediate Rollback (T < 30 min)
```bash
# Backend
gcloud run revisions list --service barber-agent-backend
gcloud run services update-traffic barber-agent-backend --to-revisions REVISION_ID=100

# Frontend (Vercel)
vercel rollback
```

### Option 2: Partial Rollback (Maintenance Mode)
```bash
# Disable new appointments (Firestore rule):
match /appointments/{apptId} {
  allow create: if false; // Maintenance
}

# Frontend → Show maintenance banner
```

### Option 3: Database Rollback
```bash
# Restore from backup
gcloud firestore databases restore --backup=gs://backup-2026-05-24T10:00:00Z
```

---

## Post-Launch (Week 1-2)

### Day 1
- [ ] Monitor error rate
- [ ] Gather initial user feedback
- [ ] Address any critical bugs

### Days 2-3
- [ ] First round of small improvements
- [ ] Customer onboarding calls (2-3 businesses)
- [ ] Collect NPS feedback

### Days 4-7
- [ ] Weekly metrics review
- [ ] Performance optimization (if needed)
- [ ] Plan next feature sprint

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| **On-Call Engineer** | Reuven Yaya | 054-659-8636 | reuven@barber-agent.co.il |
| **Product Manager** | [Name] | [Phone] | [Email] |
| **Customer Support Lead** | [Name] | [Phone] | [Email] |

---

✅ **Document Ready for Week 4 Go-Live**  
**Last Updated:** May 17, 2026  
**Next Review:** May 24, 2026 (Post-Launch)
