# 🚀 Barber Agent — Reseller Platform

Appointment booking AI agent for Israeli service businesses (barbershops, salons, clinics, tobacco shops).

## 📋 Overview

- **Backend:** Node.js + Express + TypeScript
- **Database:** Firebase Firestore
- **AI:** Gemini API (recommended) or Claude (fallback)
- **Messaging:** WhatsApp Business API
- **Frontend:** React/Next.js (separate repo)
- **Deployment:** Vercel (frontend) + Cloud Run (backend)

---

## 🎯 Project Structure

```
barber-agent-platform/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── middleware/
│   │   └── errorHandler.ts   # Global error handling
│   ├── routes/
│   │   ├── messages.ts       # WhatsApp webhook + message processing
│   │   ├── appointments.ts   # Appointment CRUD
│   │   ├── businesses.ts     # Business configuration
│   │   └── admin.ts          # Admin dashboard endpoints
│   ├── services/
│   │   ├── aiService.ts      # Gemini/Claude integration (TODO)
│   │   ├── appointmentService.ts  # Business logic (TODO)
│   │   └── notificationService.ts # Waitlist notifications (TODO)
│   └── utils/
│       ├── logger.ts         # Winston logging
│       └── validation.ts     # Input validation + injection prevention
├── config/
│   └── firebase-key.json     # Firebase service account (gitignored)
├── .env.example              # Environment template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

---

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project
- WhatsApp Business Account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/barber-agent-platform.git
cd barber-agent-platform

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your credentials

# 4. Download Firebase service account key
# Place in config/firebase-key.json

# 5. Run development server
npm run dev

# 6. Server runs on http://localhost:3000
```

---

## 📝 API Endpoints

### WhatsApp Webhook
- **GET `/api/messages/webhook`** — Verify webhook (WhatsApp)
- **POST `/api/messages/webhook`** — Receive incoming messages

### Appointments (TODO)
- **GET `/api/appointments/:businessId`** — Get appointments
- **POST `/api/appointments`** — Create appointment
- **PUT `/api/appointments/:apptId`** — Update appointment
- **DELETE `/api/appointments/:apptId`** — Cancel appointment

### Business Config (TODO)
- **GET `/api/businesses/:businessId`** — Get business config
- **PUT `/api/businesses/:businessId`** — Update business config

### Admin (TODO)
- **GET `/api/admin/dashboard`** — Dashboard metrics
- **GET `/api/admin/analytics`** — Analytics & reports

---

## 🔐 Security Features

### 4-Layer Injection Prevention
1. **Regex Validation** — Hebrew characters only, block SQL/script keywords
2. **Character Limits** — Max 500 chars per message
3. **LLM Output Validation** — Parse response for sensitive data
4. **Firestore Security Rules** — User-scoped access control

### Audit Logging
Every action (message, appointment, config change) is logged with:
- User ID
- Action type
- Timestamp
- IP address
- Severity level

### Encryption
- Firebase Firestore Rules enforce user-scoped access
- API keys stored in environment variables
- Phone numbers hashed + salted (bcrypt)

---

## 📊 Firestore Schema

### Collections (Firestore)
1. **businesses** — Customer businesses (reseller)
2. **users** — Customers (per business)
3. **appointments** — Appointments (per business)
4. **staff** — Employees (per business)
5. **waitlist** — Queue (per business)
6. **auditLogs** — Security logs (per business)
7. **settings** — Configuration (per business)
8. **scheduleExceptions** — Holidays, closures (per business)
9. **analytics** — Monthly metrics (per business)

See `../barber-agent-spec-v2.md` for detailed schema.

---

## 🤖 AI Integration

### Supported Models
- **Gemini 1.5 Flash** (recommended) — ₪0.075/1M tokens, fast
- **Claude Opus** (fallback) — High quality, ₪2,250/month at scale

### System Prompt
The AI agent extracts:
- Appointment date/time from free-text Hebrew input
- Service type (haircut, dyeing, etc.)
- Customer name (if known)

Returns 2-3 available slots or adds customer to waitlist.

---

## ⚡ Development Workflow

### Run development server
```bash
npm run dev
```

### Run tests
```bash
npm test
npm run test:watch
```

### Build for production
```bash
npm run build
npm start
```

### Code quality
```bash
npm run lint
npm run format
```

---

## 📈 Development Roadmap (4 weeks)

### Week 1: Backend Setup & AI Integration
- [x] Express app setup
- [x] Firestore initialization
- [x] WhatsApp webhook verification
- [x] Input validation + injection prevention
- [ ] Gemini API integration
- [ ] Message processing logic

### Week 2: Business Logic
- [ ] Appointment parsing from messages
- [ ] Availability checking
- [ ] Confirmation flow
- [ ] Waitlist management
- [ ] Notification system

### Week 3: Admin Dashboard
- [ ] Frontend setup (React)
- [ ] Firebase Auth + 2FA
- [ ] Calendar view + CRUD
- [ ] Staff management
- [ ] Hours & services editor

### Week 4: Deployment & Testing
- [ ] E2E testing
- [ ] Error handling
- [ ] Performance optimization
- [ ] Deploy to Vercel + Cloud Run
- [ ] Documentation + user guide

---

## 🚀 Deployment

### Backend (Cloud Run)
```bash
# Build Docker image
docker build -t barber-agent-backend .

# Deploy to Cloud Run
gcloud run deploy barber-agent-backend --image barber-agent-backend:latest
```

### Frontend (Vercel)
```bash
# Deploy from separate repo
npm run deploy
```

---

## 📞 Support & Contribution

- **Docs:** See `../barber-agent-spec-v2.md`
- **Issues:** GitHub Issues
- **Contact:** support@barber-agent.co.il

---

**Last Updated:** April 30, 2026  
**Status:** 🟡 In Development (Week 1)  
**License:** Proprietary
