# GovGrant — TTDF R&D Grant Management Platform

GovGrant is a full-stack platform for managing government R&D grant proposals end-to-end: submission, multi-reviewer evaluation, milestone-based fund release, and role-based administration — built around the workflow of India's Telecommunications Technology Development Fund (TTDF), but generic enough for any grant-management use case.

## Live Demo

- **App:** [govgrant-l4if.vercel.app](https://govgrant-l4if.vercel.app)
- **API:** [govgrant-production.up.railway.app](https://govgrant-production.up.railway.app)

Demo accounts (all use password `Password123!`):

| Email | Role | Notes |
|---|---|---|
| `admin@gmail.com` | Admin | Full platform access |
| `reviewer1@govgrant.in` | Reviewer | Has proposals assigned |
| `reviewer2@govgrant.in` | Reviewer | |
| `reviewer3@govgrant.in` | Reviewer | |
| `applicant1@govgrant.in` | Applicant | IIT Delhi |
| `applicant2@govgrant.in` | Applicant | C-DOT |
| `applicant3@govgrant.in` | Applicant | IIT Bombay |

## Features

**For applicants**
- Draft, edit, and submit funding proposals with domain, TRL level, and requested amount
- Track proposal status through the full lifecycle (Draft → Submitted → Under Review → Approved/Rejected → Funded)
- Add and track milestones once a proposal is approved, each tied to a partial fund release
- View reviewer feedback and scores

**For reviewers**
- See proposals assigned for evaluation
- Submit scored reviews with comments
- Track review completion status across assignments

**For admins**
- Manage users and roles
- Assign reviewers to submitted proposals
- Approve, reject, or advance proposal status
- Full activity log across the platform
- Dashboard with funding-by-domain and proposal-status analytics

**Platform-wide**
- JWT authentication (access + refresh tokens) with email verification and self-service password reset
- Real-time in-app notifications over Socket.IO (proposal status changes, new reviews, milestone updates, reviewer assignments) with a live unread badge
- Role-based access control enforced server-side on every route, not just hidden in the UI
- Rate limiting on auth endpoints, strong password policy, and self-registration locked to the applicant role (no client-side privilege escalation)
- Light/dark theme, animated page transitions, and a responsive layout throughout

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, TailwindCSS 4, React Router 7 |
| UI | Radix UI primitives (shadcn-style), Recharts, Framer Motion, Lucide icons |
| Data/state | TanStack Query, React Hook Form, Zod |
| Backend | Node.js, Express, TypeScript |
| Database | MySQL via Prisma ORM |
| Real-time | Socket.IO |
| Auth | JWT (access + refresh), bcrypt, Nodemailer (email verification / password reset) |
| Deployment | Vercel (frontend), Railway (backend + MySQL) |

## Project Structure

```
govgrant/
├── client/                  # React SPA
│   ├── src/
│   │   ├── api/             # Axios API clients per resource
│   │   ├── components/      # Shared + shadcn-style UI components
│   │   ├── context/         # Auth and Notification React contexts
│   │   ├── pages/           # Route-level page components (lazy-loaded)
│   │   └── routes/          # Router config, guards, layout
│   └── vercel.json          # SPA rewrite config
│
└── server/                  # Express API
    ├── prisma/
    │   ├── schema.prisma    # Data model
    │   ├── migrations/      # Versioned SQL migrations
    │   └── seed.ts          # Demo data seeding script
    └── src/
        ├── controllers/     # Request handlers
        ├── services/        # Business logic + Prisma queries
        ├── routes/          # Express route definitions
        ├── middleware/      # Auth, validation, rate limiting, error handling
        ├── socket/          # Socket.IO connection + event emitters
        └── utils/           # JWT, cookies, email, API response helpers
```

## Data Model

| Model | Purpose |
|---|---|
| `User` | Applicant, reviewer, or admin account |
| `Proposal` | A submitted grant proposal, with funding amount, TRL level, domain, and status |
| `Milestone` | A funding checkpoint tied to a proposal |
| `Review` | A reviewer's scored evaluation of a proposal |
| `ProposalAssignment` | Assigns a reviewer to a proposal |
| `Notification` | In-app notification for a user |
| `ActivityLog` | Audit trail of actions across the platform |
| `RefreshToken` / `EmailVerificationToken` / `PasswordResetToken` | Auth session and self-service account tokens |

## Getting Started

### Prerequisites

- Node.js 18+
- A MySQL database (local install or a hosted instance)

### 1. Clone and install

```bash
git clone https://github.com/aimanmunshi/govgrant.git
cd govgrant

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**`server/.env`**

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection string |
| `CLIENT_URL` | Yes | Frontend origin, used for CORS and email links (no trailing slash) |
| `ACCESS_TOKEN_SECRET` | Yes | JWT signing secret, 10+ characters |
| `REFRESH_TOKEN_SECRET` | Yes | JWT signing secret, 10+ characters |
| `PORT` | No | Defaults to `5000` |
| `ACCESS_TOKEN_EXPIRY` | No | Defaults to `15m` |
| `REFRESH_TOKEN_EXPIRY` | No | Defaults to `7d` |
| `EMAIL_USER` / `EMAIL_APP_PASSWORD` | No | Gmail SMTP credentials for verification/reset emails. Omit to disable email sending (the app still runs; emails are skipped with a console warning) |

**`client/.env`** (see `client/.env.example`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Backend URL. Defaults to `http://localhost:5000` |

### 3. Set up the database

```bash
cd server
npx prisma migrate deploy
npm run db:seed   # optional — populates demo accounts and sample proposals
```

### 4. Run it

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

The app will be available at `http://localhost:5173`, the API at `http://localhost:5000`.

## API Overview

All endpoints are prefixed with `/api` and (except auth) require a `Bearer` access token.

| Base path | Resource |
|---|---|
| `/api/auth` | Register, login, refresh, logout, profile, email verification, password reset |
| `/api/proposals` | CRUD, submission, status changes, reviewer assignment |
| `/api/proposals/:id/milestones`, `/api/milestones/:id` | Milestone tracking |
| `/api/proposals/:id/reviews` | Review submission and retrieval |
| `/api/users` | Admin-only user management |
| `/api/activity` | Admin-only audit log |
| `/api/notifications` | In-app notifications |

## Scripts

**server/**

| Command | Purpose |
|---|---|
| `npm run dev` | Start the API with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run the compiled build |
| `npm run db:seed` | Seed demo data |

**client/**

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |

## License

[MIT](LICENSE)
