# Production Setup

Checklist and env configuration for running Ritwil in production.

---

## 1. Backend environment (`Backend/.env`)

| Variable | Production value | Notes |
|----------|------------------|--------|
| `NODE_ENV` | `production` | Enables secure cookies, strict CORS, Helmet CSP |
| `DATABASE_URL` | Your production Postgres URL | From Supabase/Railway/etc. |
| `PORT` | `4000` or your host's port | |
| `CLIENT_ORIGIN` | Your frontend URL(s) | One origin or comma-separated, e.g. `https://app.ritwil.com` or `https://app.ritwil.com,https://www.ritwil.com` |
| `FRONTEND_URL` | Same as frontend URL, no trailing slash | Used in password-reset links, e.g. `https://app.ritwil.com` |
| `JWT_ACCESS_SECRET` | Long random string | e.g. `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Long random string | Different from access secret |
| `JWT_ACCESS_TTL` | e.g. `15m` | Optional |
| `JWT_REFRESH_TTL` / `JWT_REFRESH_TTL_DAYS` | e.g. `30d` / `30` | Optional |
| SMTP_* | Your mail provider | Required if you want forgot-password emails |

**CORS:** Backend allows only origins listed in `CLIENT_ORIGIN`. Must match the exact scheme + host + port the browser uses (e.g. `https://app.ritwil.com`).

---

## 2. Frontend environment (`Frontend/.env`)

| Variable | When to set | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Only when frontend is on a **different domain** than the API | `https://api.ritwil.com/api` |

- **Same-origin (recommended):** Backend serves the built frontend; do **not** set `VITE_API_BASE_URL`. The app uses `/api`, which is same host.
- **Cross-origin:** Frontend on e.g. Vercel, API on Railway. Set `VITE_API_BASE_URL` to the full API base URL (e.g. `https://api.ritwil.com/api`). Backend `CLIENT_ORIGIN` must include the frontend origin.

---

## 3. Deployment patterns

### A. Backend and frontend on same server (single Node app)

1. Build frontend: `cd Frontend && npm run build`
2. Backend serves `Frontend/dist` (already configured in `server.js` when `NODE_ENV=production`)
3. Set `CLIENT_ORIGIN` to your public URL, e.g. `https://app.ritwil.com`
4. Set `FRONTEND_URL` to the same
5. Do **not** set `VITE_API_BASE_URL` (requests go to `/api` on same host)

### B. Frontend and backend on different hosts

1. **Backend:** Deploy Node app; set `CLIENT_ORIGIN` to frontend URL(s), e.g. `https://app.ritwil.com`
2. **Frontend:** Set `VITE_API_BASE_URL` to backend API URL, e.g. `https://api.ritwil.com/api`
3. Build: `cd Frontend && npm run build` (env vars are baked in at build time)
4. Deploy the `Frontend/dist` folder to your frontend host
5. Set `FRONTEND_URL` on backend to the frontend URL (for reset links)

---

## 4. Build and run

```bash
# From project root

# Install dependencies
npm run install:all

# Database
npm run db:push

# Build frontend (for same-server deploy)
cd Frontend && npm run build

# Start backend (serves API + static frontend if NODE_ENV=production)
cd Backend && npm start
```

---

## 5. Security checklist

- [ ] `NODE_ENV=production` on backend
- [ ] Strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (not default placeholders)
- [ ] `CLIENT_ORIGIN` exactly matches frontend URL(s); no wildcards
- [ ] HTTPS in production (backend and frontend)
- [ ] `.env` not committed; use `.env.example` as template
- [ ] Database connection string uses SSL if required by provider

---

## 6. Quick reference

| Concern | Where | Env / config |
|--------|--------|---------------|
| CORS | Backend | `CLIENT_ORIGIN` (comma-separated allowed) |
| Frontend URL (reset links) | Backend | `FRONTEND_URL` |
| API URL (frontend) | Frontend | `VITE_API_BASE_URL` (only if API on different domain) |
| Secure cookies | Backend | Set automatically when `NODE_ENV=production` |
| Static files | Backend | Serves `Frontend/dist` when `NODE_ENV=production` |
