# 🛡️ Cybersecurity Awareness & Human Firewall Platform

An adaptive cybersecurity awareness training platform that measures not just *whether* an employee completed training, but *whether they can actually recognize and respond to a real cyberattack*. It trains users, tests them with simulated phishing, measures their behavior, predicts their risk with machine learning, and turns it all into a single explainable **Human Risk Score** — the "Human Firewall" concept at the heart of the system.

Built as a three-service architecture: an Angular frontend, a Node.js/Express API, and a Python machine-learning microservice, backed by PostgreSQL and Redis.

---

## Core concept

**Train → Test → Measure → Predict → Adapt**

A user completes training and quizzes, receives simulated phishing emails, and every action they take (passing a quiz, clicking a phishing link, reporting a suspicious email) feeds a live risk score and a machine-learning risk prediction. Administrators see risk across the whole organization, receive AI-driven predictions with explanations, export reports, and manage the platform — with every administrative action audit-logged.

---

## Key features

### Training & assessment
- Role-based authentication (Super Admin -> Org Admin -> Trainer -> Manager -> Employee), enforced on the backend
- Course management with nested lessons and auto-scored quizzes
- Server-side quiz scoring with correct answers hidden from the browser (anti-cheat)
- Progress tracking of every attempt

### The Human Firewall Score
- 0-100 security score mapped to five risk levels (Very Low -> Critical)
- Derived from quiz performance and adjusted by phishing behavior
- Weak/strong area breakdown by category

### Phishing simulation
- Admin-created simulated phishing campaigns delivered to an in-app inbox
- Behavioral tracking (clicked vs. reported) with immediate educational feedback
- **Adaptive difficulty**: each user is served campaigns matched to their readiness level
- **Scheduled campaigns**: campaigns can be scheduled to activate at a future time via background jobs
- Safe by design — no real emails, no credential capture

### Machine learning (AI microservice)
- A trained **XGBoost** model predicts each user's risk level from their behavior
- **Explainable predictions** — the model returns which factors drove each prediction and their effect
- Served as an independent Python/FastAPI microservice, integrated with the main app
- Graceful degradation — the platform keeps working if the ML service is offline

### Engagement
- Gamification: points, levels, badges, and an organization-wide leaderboard
- Near-real-time in-app notifications (bell with unread count)
- Email notifications for key events (welcome, quiz results, incident updates)

### Administration
- Personal dashboard (risk card, stats, gamification, activity)
- Admin dashboard (org-wide metrics, per-user risk, AI predictions with explanations)
- User management (create, role changes, soft-delete deactivation, self-protection)
- Incident reporting with an admin review queue
- Analytics dashboard with interactive charts
- PDF risk report export per user
- Audit logging of all administrative actions

### Design
- Consistent glowing cyber dark theme built on central CSS design tokens

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Angular (standalone components, TypeScript) |
| Charts | Chart.js (ng2-charts) |
| Backend API | Node.js + Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Cache / queue | Redis |
| Background jobs | BullMQ |
| Email | Nodemailer |
| PDF | PDFKit |
| ML service | Python + FastAPI + XGBoost + scikit-learn |
| Containerization | Docker + Docker Compose |

---

## Architecture

```
Angular frontend (4200)  --HTTP-->  Node.js + Express API (3000)  --Prisma-->  PostgreSQL + Redis (Docker)
                                            |
                                            +--HTTP-->  Python ML service (FastAPI + XGBoost, 8000)
                                            |
                              BullMQ worker (background jobs: scheduled campaigns)
```

The frontend never trusts itself for security: a JWT interceptor attaches the token to every request, route guards protect pages, and the backend independently verifies token and role on every protected endpoint. The ML service is a specialist microservice the API calls for predictions. A separate worker process consumes background jobs from Redis.

---

## Getting started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Docker Desktop
- Angular CLI (npm install -g @angular/cli)

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/cyber-awareness-platform.git
cd cyber-awareness-platform
```

### 2. Start database + cache (Docker Desktop must be running)
```bash
docker compose up -d
```
Starts PostgreSQL (5432) and Redis (6379).

### 3. Backend API
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```
Runs at http://localhost:3000 . Check http://localhost:3000/api/health .

Create backend/.env:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=cyber_admin
DB_PASSWORD=dev_password_change_me
DB_NAME=cyber_awareness
DATABASE_URL="postgresql://cyber_admin:dev_password_change_me@localhost:5432/cyber_awareness?schema=public"
JWT_SECRET=change_this_to_a_long_random_string
REDIS_HOST=localhost
REDIS_PORT=6379
ML_SERVICE_URL=http://localhost:8000
```

### 4. Background worker (separate terminal)
```bash
cd backend
npm run worker
```

### 5. ML service (separate terminal)
```bash
cd ai-service
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
python generate_data.py
python train_model.py
uvicorn main:app --reload --port 8000
```
Runs at http://localhost:8000 . Interactive docs at http://localhost:8000/docs .

### 6. Frontend (separate terminal)
```bash
cd frontend/cyber-frontend
npm install
ng serve
```
Runs at http://localhost:4200 .

> Full setup runs five processes: PostgreSQL/Redis (Docker), the API, the worker, the ML service, and the frontend.

---

## Project structure

```
cyber-awareness-platform/
├── frontend/cyber-frontend/     # Angular app
├── backend/
│   ├── src/
│   │   ├── config/              # Prisma + Redis connections
│   │   ├── middleware/          # authenticate + authorize (RBAC)
│   │   ├── routes/              # auth, courses, lessons, quizzes, progress,
│   │   │                        # risk, admin, campaigns, users, incidents,
│   │   │                        # notifications, gamification, analytics,
│   │   │                        # prediction, reports, audit
│   │   ├── utils/               # riskEngine, gamification, adaptiveDifficulty,
│   │   │                        # mlService, email, audit, notify
│   │   ├── queues/              # BullMQ campaign queue
│   │   ├── workers/             # background job worker
│   │   └── app.js
│   └── prisma/schema.prisma
├── ai-service/                  # Python ML microservice
│   ├── main.py                  # FastAPI app + /predict
│   ├── generate_data.py         # synthetic data generator
│   ├── train_model.py           # XGBoost training
│   └── risk_model.joblib        # trained model
├── docker-compose.yml
└── README.md
```

---

## Machine learning model

- **Algorithm**: XGBoost multi-class classifier
- **Features**: average quiz score, quizzes taken, phishing links clicked, phishing emails reported, incidents reported
- **Output**: predicted risk (LOW / MEDIUM / HIGH), confidence, per-class probabilities, and a factor-level explanation
- **Training data**: synthetically generated (2,000 users) with realistic behavior->risk patterns and noise. In production the model would be retrained on real data.
- **Test accuracy**: ~82% on held-out data. The most important features learned are phishing clicks and reports — matching security intuition.

---

## Security notes
- Passwords hashed with bcrypt; never stored in plain text
- Quiz correct answers stripped from responses; scoring is server-side
- Phishing simulations never send real emails or capture credentials
- All protected routes verify JWT + role on the server
- User deactivation is a soft-delete (preserves audit trail); users can't lock themselves out
- All administrative actions are audit-logged

---

## Risk scoring model

| Score | Risk Level |
|---|---|
| 81-100 | Very Low |
| 61-80 | Low |
| 41-60 | Medium |
| 21-40 | High |
| 0-20 | Critical |

Higher score = lower risk. Derived from quiz performance, adjusted by phishing behavior (reporting raises it, clicking lowers it), with weak/strong areas surfaced by category. The ML model provides an independent predictive view alongside this rule-based score.

---

## License
Developed as a final-year academic project.