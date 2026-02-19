# Setup – run scripts, everything done automatically

Use these from the **project root** (or from `Backend` for DB-only).

## One command – full setup (new machine / new database)

```bash
npm run setup
```

This will:
1. Install Backend + Frontend dependencies
2. Generate Prisma client from `schema.prisma`
3. Apply schema to the database (`prisma db push` – no migration files needed)

**Requirement:** Copy `Backend/.env.example` to `Backend/.env` and set at least `DATABASE_URL` (and JWT secrets for production).

---

## Other useful scripts

| Command | What it does |
|--------|-------------------------------|
| `npm run setup` | Install deps + sync DB (run this first) |
| `npm run db:setup` | Only DB: generate client + push schema (from root) |
| `npm run db:push` | Only push schema to DB (from root) |
| `npm run db:generate` | Only regenerate Prisma client (from root) |
| `npm run db:seed` | Run seed script (from root) |
| `npm run build` | Install + build Frontend + DB setup (for deployment) |
| `npm run start` | Start Backend (production) |
| `npm run dev:backend` | Start Backend with nodemon |
| `npm run dev:frontend` | Start Frontend dev server |

### From `Backend` folder

| Command | What it does |
|--------|-------------------------------|
| `npm run setup` | Generate Prisma client + push schema to DB |
| `npm run db:setup` | Same as above |
| `npm run db:setup:seed` | Setup + run seed |
| `npm run db:push` | Push schema only |
| `npm run db:generate` | Generate client only |
| `npm run dev` | Start server with nodemon |

---

## New database checklist

1. Create the database (e.g. new Postgres DB on Supabase/local).
2. Put the connection string in `Backend/.env` as `DATABASE_URL`.
3. From project root run: **`npm run setup`**
4. (Optional) Seed data: **`npm run db:seed`**

Done. No manual SQL or migration files required when using `db push`.

**📖 Detailed guide:** See `Backend/DATABASE_SETUP.md` for step-by-step instructions, troubleshooting, and what gets created.

**🚀 Production:** See `PRODUCTION.md` for env (CORS, frontend URL, API URL), deployment patterns, and security checklist.

---

## Forgot password

- **Frontend:** Login page has a “Forgot password?” link → `/forgot-password` (enter email) → user receives reset link → `/reset-password?token=...` (set new password).
- **Backend:** Set `FRONTEND_URL` in `Backend/.env` (e.g. `http://localhost:5173`) so reset links point to your app.
- **Email (optional):** To send reset links by email, configure Resend in `Backend/.env`:
  - `RESEND_API_KEY`: Your Resend API key (get from https://resend.com/api-keys)
  - `RESEND_FROM_EMAIL`: Verified sender email (e.g. `"Ritwil <noreply@yourdomain.com>"`)
  - **Important:** Domain must be verified in Resend Dashboard (https://resend.com/domains)
  - Without Resend configured, in non-production the API may return the reset link in the response for testing.
