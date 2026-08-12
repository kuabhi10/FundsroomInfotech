# Fundsroom Infotech

A full-stack business operations platform for managing customers, products, inventory, challans (delivery orders), and invoices — built as an npm workspace monorepo.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
  - [Backend — Railway](#backend--railway)
  - [Frontend — Vercel](#frontend--vercel)
- [API Reference](#api-reference)
- [Default Credentials](#default-credentials)

---

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Zustand, React Router v7 |
| Backend   | Node.js v24, Express.js v5, TypeScript      |
| Database  | PostgreSQL (via Prisma ORM v6)              |
| Auth      | JWT (jsonwebtoken), bcrypt                  |
| Monorepo  | npm Workspaces                              |

---

## Project Structure

```
fundsroom/
├── backend/                    # Express API server
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Database seeder
│   ├── src/
│   │   ├── modules/            # Feature modules (auth, customers, products, etc.)
│   │   ├── middleware/         # Auth & validation middleware
│   │   ├── config/             # Prisma client config
│   │   ├── utils/              # Shared utilities
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── stores/             # Zustand state stores
│   │   ├── lib/                # API client, utilities
│   │   └── main.tsx            # App entry point
│   ├── .env.example
│   ├── vercel.json             # SPA routing config for Vercel
│   └── package.json
├── docs/                       # Project documentation
│   ├── api.md                  # Full API reference
│   ├── schema.md               # Database schema docs
│   └── prd.md                  # Product requirements
├── package.json                # Monorepo root (npm workspaces)
└── README.md
```

---

## Prerequisites

Ensure you have the following installed before proceeding:

| Tool        | Version     | Download                                         |
|-------------|-------------|--------------------------------------------------|
| Node.js     | v24.x       | https://nodejs.org                               |
| npm         | v10+        | Included with Node.js                            |
| PostgreSQL  | v14+        | https://www.postgresql.org/download              |
| Git         | Latest      | https://git-scm.com                              |

Verify your versions:
```bash
node --version    # Should be v24.x
npm --version     # Should be v10+
psql --version    # Should be v14+
```

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repo-url>
cd fundsroom
```

### 2. Install All Dependencies

Since this is an npm workspace monorepo, a single install from the root installs dependencies for both `backend/` and `frontend/`:

```bash
npm install
```

### 3. Configure Environment Variables

**Backend** — copy and fill in `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

**Frontend** — copy and fill in `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

See the [Environment Variables](#environment-variables) section below for details on each variable.

### 4. Set Up the Database

```bash
# Generate the Prisma client
cd backend
npx prisma generate

# Run all migrations to create the database schema
npx prisma migrate deploy

# (Optional but recommended) Seed the database with demo data
npx prisma db seed
```

### 5. Start the Development Servers

Open **two terminal windows** and run each concurrently:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App starts on http://localhost:5173
```

The frontend is now accessible at **http://localhost:5173** and proxies API calls to the backend at **http://localhost:3000**.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Required | Description                                              | Example                                               |
|----------------|----------|----------------------------------------------------------|-------------------------------------------------------|
| `DATABASE_URL` | ✅       | Full PostgreSQL connection string                        | `postgresql://user:pass@localhost:5432/fundsroom`     |
| `JWT_SECRET`   | ✅       | Secret key used to sign JWT tokens. Use a long random string in production. | `a_very_long_random_secret_string_here`   |
| `PORT`         | ❌       | Port the Express server listens on (default: `3000`)    | `3000`                                                |
| `FRONTEND_URL` | ❌       | Comma-separated list of allowed CORS origins            | `http://localhost:5173,https://yourapp.vercel.app`    |

```env
# backend/.env
DATABASE_URL="postgresql://johndoe:password@localhost:5432/fundsroom?schema=public"
JWT_SECRET="replace_with_a_long_random_secret"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

> **Security:** Never commit your `.env` file. It is already listed in `.gitignore`.

### Frontend (`frontend/.env`)

| Variable            | Required | Description                                 | Example                        |
|---------------------|----------|---------------------------------------------|--------------------------------|
| `VITE_API_BASE_URL` | ✅       | Base URL of the backend API server          | `http://localhost:3000`        |

```env
# frontend/.env
VITE_API_BASE_URL="http://localhost:3000"
```

---

## Database Setup

The project uses **Prisma** for database migrations and schema management.

### Common Prisma Commands

```bash
# Run from backend/ directory

# Apply all pending migrations (use in production / CI)
npx prisma migrate deploy

# Create and apply a new migration after schema changes (use in development)
npx prisma migrate dev --name your_migration_name

# Generate Prisma client after schema changes
npx prisma generate

# Seed the database with demo users, customers, and products
npx prisma db seed

# Open Prisma Studio (visual database browser)
npx prisma studio

# Reset the database (CAUTION: drops all data)
npx prisma migrate reset
```

### Database Schema Overview

| Table                | Description                                      |
|----------------------|--------------------------------------------------|
| `users`              | System users with role-based access              |
| `customers`          | Customer records (LEAD / ACTIVE / INACTIVE)      |
| `customer_notes`     | Notes attached to customer records               |
| `products`           | Product catalog with stock levels                |
| `stock_movements`    | Audit log of all stock IN / OUT events           |
| `challans`           | Delivery orders (DRAFT → CONFIRMED → CANCELLED) |
| `challan_items`      | Line items within a challan                      |
| `invoices`           | Invoices generated from confirmed challans       |
| `challan_sequences`  | Auto-increment sequence for challan numbers      |
| `invoice_sequences`  | Auto-increment sequence for invoice numbers      |

See [`docs/schema.md`](./docs/schema.md) for the full schema reference.

---

## Running the Application

### Development Mode (with hot-reload)

```bash
# Backend (from backend/)
npm run dev

# Frontend (from frontend/)
npm run dev
```

### Production Build

```bash
# From the monorepo root — builds the backend TypeScript
npm run build

# Start the compiled backend server
npm start
```

---

## Available Scripts

### Root (monorepo)

| Script        | Command           | Description                              |
|---------------|-------------------|------------------------------------------|
| `npm run build` | `npm run build --prefix backend` | Compiles the backend TypeScript |
| `npm start`     | `npm run start --prefix backend` | Starts the compiled production server |

### Backend (`cd backend`)

| Script            | Command                        | Description                                        |
|-------------------|--------------------------------|----------------------------------------------------|
| `npm run dev`     | `tsx watch src/server.ts`      | Start dev server with hot-reload                   |
| `npm run build`   | `prisma generate && tsc`       | Generate Prisma client + compile TypeScript        |
| `npm start`       | `node dist/server.js`          | Start the compiled production server               |

### Frontend (`cd frontend`)

| Script             | Command              | Description                                     |
|--------------------|----------------------|-------------------------------------------------|
| `npm run dev`      | `vite`               | Start Vite dev server with HMR                  |
| `npm run build`    | `tsc -b && vite build` | Type-check and build for production             |
| `npm run preview`  | `vite preview`       | Preview the production build locally            |
| `npm run lint`     | `oxlint`             | Run the linter                                  |

---

## Deployment

### Backend — Railway

The backend is designed to be deployed on **[Railway](https://railway.app)** (or any Node.js-compatible host).

#### Step-by-step

1. **Create a new Project** on Railway and connect your GitHub repository.

2. **Configure the build & start commands:**

   | Setting        | Value                         |
   |----------------|-------------------------------|
   | Root Directory | `backend`                     |
   | Build Command  | `npm install && npm run build` |
   | Start Command  | `npm start`                   |
   | Node Version   | `24`                          |

3. **Add Environment Variables** in the Railway dashboard (Variables tab):

   | Key            | Value                                        |
   |----------------|----------------------------------------------|
   | `DATABASE_URL` | Your production PostgreSQL connection string  |
   | `JWT_SECRET`   | A long, random production secret             |
   | `PORT`         | `3000` (or leave unset — Railway sets it)     |
   | `FRONTEND_URL` | Your Vercel frontend URL, e.g. `https://fundsroom.vercel.app` |

4. **Provision a PostgreSQL database** on Railway (or use a managed service like [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and paste the connection string as `DATABASE_URL`.

5. **Run migrations** — Add a one-time job or pre-deploy command:
   ```bash
   npx prisma migrate deploy
   ```
   You can add this at the start of the build command:
   ```bash
   npm install && npm run build && npx prisma migrate deploy
   ```

6. **Deploy.** Railway will automatically redeploy on every push to `main`.

---

### Frontend — Vercel

The frontend is a Vite SPA configured for deployment on **[Vercel](https://vercel.com)**.

#### Step-by-step

1. **Import the repository** into Vercel from the dashboard.

2. **Configure the project settings:**

   | Setting          | Value                 |
   |------------------|-----------------------|
   | Framework Preset | `Vite`                |
   | Root Directory   | `frontend`            |
   | Build Command    | `npm run build`       |
   | Output Directory | `dist`                |
   | Install Command  | `npm install`         |

3. **Add Environment Variables** in the Vercel dashboard (Settings → Environment Variables):

   | Key                  | Value                                        |
   |----------------------|----------------------------------------------|
   | `VITE_API_BASE_URL`  | Your Railway backend URL, e.g. `https://fundsroom-api.up.railway.app` |

4. **SPA Routing** is already handled by [`frontend/vercel.json`](./frontend/vercel.json), which rewrites all routes to `index.html` so React Router works correctly.

5. **Deploy.** Vercel deploys automatically on every push to `main`. Preview deployments are created for every pull request.

---

## API Reference

Full API documentation is available at [`docs/api.md`](./docs/api.md).

### Quick Reference — Base URLs

| Environment | Backend URL                          | Frontend URL                       |
|-------------|--------------------------------------|------------------------------------|
| Local       | `http://localhost:3000`              | `http://localhost:5173`            |
| Production  | `https://<your-railway-app>.up.railway.app` | `https://<your-app>.vercel.app` |

### Authentication

All API endpoints (except `POST /auth/login` and `GET /health`) require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

Tokens expire after **8 hours**.

### Module Summary

| Module             | Base Path          | Description                              |
|--------------------|--------------------|------------------------------------------|
| Auth               | `/auth`            | Login, get current user                  |
| Users              | `/users`           | User management (ADMIN only)             |
| Customers          | `/customers`       | Customer CRUD + notes                    |
| Products           | `/products`        | Product catalog management               |
| Stock Movements    | `/stock-movements` | Manual stock adjustments & audit log     |
| Challans           | `/challans`        | Delivery order lifecycle management      |
| Invoices           | `/invoices`        | Invoice generation + PDF export          |
| Dashboard          | `/dashboard`       | KPI summary metrics                      |

---

> **Important:** Change all passwords immediately in any production or staging environment.

---

## Role Permissions Summary

| Feature                    | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|----------------------------|:-----:|:-----:|:---------:|:--------:|
| User management            | ✅    | ❌    | ❌        | ❌       |
| Create / edit customers    | ✅    | ✅    | ❌        | ❌       |
| View customers             | ✅    | ✅    | ✅        | ✅       |
| Create / edit products     | ✅    | ❌    | ✅        | ❌       |
| Manage stock movements     | ✅    | ❌    | ✅        | ❌       |
| Create / manage challans   | ✅    | ✅    | ✅        | ❌       |
| View challans              | ✅    | ✅    | ✅        | ✅       |
| Generate invoices          | ✅    | ✅    | ❌        | ❌       |
| View & download invoices   | ✅    | ✅    | ❌        | ✅       |
| Dashboard                  | ✅    | ✅    | ✅        | ✅       |

---

## Known Limitations / Incomplete Parts (MVP Scope)

As defined in the product requirements, the following features are explicitly out of scope for this MVP version:
- **Purchase Orders:** Mentioned in the broader business context but excluded from required modules.
- **Payment Tracking:** Invoices do not track payment status or installments.
- **Authentication Extras:** No refresh tokens or password reset flows are implemented yet.
- **Advanced Infrastructure:** S3 image uploads, Dockerization, and GitHub Actions CI/CD were skipped to prioritize core business logic and PDF generation.

---

*Fundsroom Infotech — v1.0.0*
