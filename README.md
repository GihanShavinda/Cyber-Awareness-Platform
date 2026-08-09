# 🛡️ Cybersecurity Awareness & Human Firewall Platform

An adaptive cybersecurity awareness training platform that goes beyond videos and quizzes. Instead of only asking *"Did the employee complete training?"*, it continuously measures **knowledge, behavior, and attack response** to answer a harder question: *"Can this person actually recognize and respond to a real cyberattack?"*

The platform trains users, tests them with simulated attacks, measures their behavior, and turns it all into a single explainable **Human Risk Score** — the "Human Firewall" concept at the core of the system.

---

## Core concept

**Train → Test → Measure → Adapt**

A user completes training and quizzes, receives simulated phishing emails, and every action they take (passing a quiz, clicking a phishing link, reporting a suspicious email) feeds a live risk score. Administrators see risk across the whole organization and can identify high-risk users at a glance.

---

## Key features

- **Authentication & role-based access control (RBAC)** — JWT-based login with a role hierarchy (Super Admin → Org Admin → Trainer → Manager → Employee). Authorization is enforced on the backend, not just hidden in the UI.
- **Learning module** — Admins and trainers create courses, each containing lessons and quizzes. Quizzes support scenario-based questions and are scored automatically.
- **Progress tracking** — Every quiz attempt is saved with score, pass/fail status, and timestamp.
- **Human Risk Score engine** — Converts a user's quiz performance and phishing behavior into a 0–100 security score mapped to a risk level (Very Low → Critical), with weak/strong area breakdowns.
- **Phishing simulation** — Admins create simulated phishing campaigns. Users receive them in a simulated inbox and can click or report. Behavior is recorded and (importantly) **no real credentials are ever collected**.
- **Behavior-driven risk** — Clicking a phishing link raises a user's risk; reporting it lowers it, reflecting real-world security behavior.
- **Personal dashboard** — Shows a user's Human Firewall Score, stats, and recent activity.
- **Admin dashboard** — Organization-wide view: total users, average score, high-risk user count, and a per-user risk table.
- **Cyber dark theme** — A consistent glowing teal/violet/green dark UI built on central CSS design tokens.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Angular (standalone components, TypeScript) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt password hashing |
| Cache/Infra | Redis (via Docker) |
| Containerization | Docker + Docker Compose |

---

## Architecture overview

```
Angular (frontend, port 4200)
        |
     HTTP / REST  (JWT in Authorization header)
        |
Node.js + Express API (port 3000)
        |
   Prisma ORM
        |
PostgreSQL  +  Redis   (Docker containers)
```

The frontend never trusts itself for security: an HTTP interceptor attaches the JWT to every request, route guards protect pages, and the **backend independently verifies the token and role** on every protected endpoint.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Angular CLI](https://angular.dev/tools/cli) (`npm install -g @angular/cli`)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/cyber-awareness-platform.git
cd cyber-awareness-platform
```

### 2. Start the database and cache

From the project root (Docker Desktop must be running):

```bash
docker compose up -d
```

This starts PostgreSQL (port 5432) and Redis (port 6379).

### 3. Set up the backend

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

The API runs at `http://localhost:3000`. Verify with `http://localhost:3000/api/health` — it should return a status of `ok`.

Create a `.env` file in `backend/` with:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=cyber_admin
DB_PASSWORD=dev_password_change_me
DB_NAME=cyber_awareness
DATABASE_URL="postgresql://cyber_admin:dev_password_change_me@localhost:5432/cyber_awareness?schema=public"
JWT_SECRET=change_this_to_a_long_random_string
```

### 4. Set up the frontend

```bash
cd frontend/cyber-frontend
npm install
ng serve
```

The app runs at `http://localhost:4200`.

---

## Project structure

```
cyber-awareness-platform/
├── frontend/
│   └── cyber-frontend/        # Angular application
├── backend/
│   ├── src/
│   │   ├── config/            # Prisma client
│   │   ├── middleware/        # authenticate + authorize (RBAC)
│   │   ├── routes/            # auth, courses, lessons, quizzes, progress, risk, admin, campaigns
│   │   ├── utils/             # riskEngine (Human Risk Score logic)
│   │   └── app.js             # Express entry point
│   └── prisma/
│       └── schema.prisma      # Database models
├── docker-compose.yml         # PostgreSQL + Redis
└── README.md
```

---

## Key API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a user |
| POST | `/api/auth/login` | Public | Log in, receive JWT |
| GET | `/api/courses` | Any logged-in | List courses |
| POST | `/api/courses` | Admin/Trainer | Create a course |
| GET | `/api/quizzes/:id` | Any logged-in | Get a quiz (correct answers hidden) |
| POST | `/api/quizzes/:id/submit` | Any logged-in | Submit answers, get scored |
| GET | `/api/progress/me` | Any logged-in | Own training history |
| GET | `/api/risk/me` | Any logged-in | Own Human Risk Score |
| GET | `/api/admin/overview` | Admin only | Organization-wide risk view |
| POST | `/api/campaigns` | Admin/Trainer | Create a phishing campaign |
| POST | `/api/campaigns/:id/respond` | Any logged-in | Record click/report behavior |

---

## Security notes

- Passwords are hashed with bcrypt — plain-text passwords are never stored.
- Quiz correct answers are stripped from API responses so they can't be read in the browser; scoring happens server-side.
- Phishing simulations never send real emails or capture real credentials — only the behavioral event (clicked / reported) is recorded.
- All protected routes verify the JWT and the user's role on the server.

---

## Risk scoring model

The Human Risk Score maps a 0–100 security score to a risk level:

| Score | Risk Level |
|---|---|
| 81–100 | Very Low |
| 61–80 | Low |
| 41–60 | Medium |
| 21–40 | High |
| 0–20 | Critical |

A higher score means lower risk. The score is derived from quiz performance and adjusted by phishing behavior (reporting raises it, clicking lowers it), with weak and strong areas surfaced by category.

---

## Roadmap / future work

Features designed in the SRS and planned as future extensions:

- Machine-learning risk *prediction* (identifying users likely to become high-risk) using models such as XGBoost / Random Forest
- Gamification: points, badges, levels, and leaderboards
- Incident reporting workflow
- Real email delivery for phishing campaigns (with tracking pixels and safe simulated landing pages)
- Adaptive phishing difficulty that responds to user performance
- Real-time admin dashboard updates via WebSocket
- Compliance and organization benchmarking reports

---

## License

This project was developed as a final-year academic project.