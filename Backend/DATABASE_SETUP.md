# Database Setup Guide – Connect to New Database

Complete guide to connect to a new PostgreSQL database and create all tables.

---

## Step 1: Get Your Database Connection String

### Option A: Supabase (Cloud PostgreSQL)

1. Go to your Supabase project → **Project Settings** → **Database**
2. Find **Connection string** section
3. Copy the **URI** format (looks like):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. If password has special characters, URL-encode them (e.g. `@` becomes `%40`)

### Option B: Local PostgreSQL

1. Install PostgreSQL locally (if not installed)
2. Create a new database:
   ```sql
   CREATE DATABASE ritwil;
   ```
3. Connection string format:
   ```
   postgresql://postgres:yourpassword@localhost:5432/ritwil
   ```

### Option C: Other Cloud Providers (AWS RDS, Railway, etc.)

- Get the connection string from your provider's dashboard
- Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

---

## Step 2: Configure Environment Variables

1. **Open** `Backend/.env` (or copy from `Backend/.env.example` if it doesn't exist)

2. **Set `DATABASE_URL`** with your connection string:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

3. **Set other required variables** (at minimum for new DB):
   ```env
   DATABASE_URL=your-connection-string-here
   JWT_ACCESS_SECRET=your-long-random-secret-here
   JWT_REFRESH_SECRET=your-long-random-secret-here
   PORT=4000
   NODE_ENV=development
   CLIENT_ORIGIN=http://localhost:5173
   FRONTEND_URL=http://localhost:5173
   ```

   **Generate secrets** (optional, for production):
   ```bash
   # Windows PowerShell:
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

   # Mac/Linux:
   openssl rand -base64 32
   ```

---

## Step 3: Push Schema to Database

From the **project root** (`ritwil/`), run:

```bash
npm run setup
```

**OR** from the `Backend/` folder:

```bash
npm run db:setup
```

**What this does:**
- Generates Prisma client from `schema.prisma`
- Connects to your database (using `DATABASE_URL`)
- Creates **all tables** defined in the schema:
  - `User`
  - `EmployeeProfile`
  - `Team`
  - `RefreshToken`
  - `PasswordResetToken`
  - `PersonalPlacement`
  - `TeamPlacement`
  - `PlacementImportBatch`
  - `AuditLog`
  - `Campaign`
  - `CampaignTeamLead`
  - And all relations/indexes

---

## Step 4: Verify Tables Were Created

### Option A: Check via Prisma Studio

```bash
cd Backend
npx prisma studio
```

Opens a browser UI where you can see all tables.

### Option B: Check via SQL

Connect to your database and run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all the tables listed above.

---

## Troubleshooting

### Error: "Unique constraint failed on vbid"

**Problem:** Your database has duplicate `vbid` values in `EmployeeProfile`, so the unique constraint can't be added.

**Solution:**

1. **Option 1:** Fix duplicates first (recommended)
   ```sql
   -- Find duplicates
   SELECT vbid, COUNT(*) 
   FROM "EmployeeProfile" 
   WHERE vbid IS NOT NULL 
   GROUP BY vbid 
   HAVING COUNT(*) > 1;

   -- Set duplicates to NULL (or assign unique values)
   UPDATE "EmployeeProfile" 
   SET vbid = NULL 
   WHERE vbid IN (
     SELECT vbid FROM "EmployeeProfile" 
     WHERE vbid IS NOT NULL 
     GROUP BY vbid 
     HAVING COUNT(*) > 1
   );
   ```
   Then run `npm run db:push` again.

2. **Option 2:** Temporarily remove unique constraint
   - Edit `Backend/prisma/schema.prisma`
   - Remove `@unique` from `EmployeeProfile.vbid`
   - Run `npm run db:push`
   - Fix duplicates later, then add `@unique` back

### Error: "Table already exists"

**Problem:** Some tables already exist from a previous push.

**Solution:** This is fine. Prisma will only create missing tables. If you want a **fresh start**:

```sql
-- ⚠️ WARNING: This deletes ALL data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then run `npm run db:push` again.

### Error: "Connection refused" or "Database does not exist"

**Problem:** Wrong `DATABASE_URL` or database not accessible.

**Solution:**
- Check `DATABASE_URL` in `Backend/.env` is correct
- Verify database exists and is running
- Check firewall/network allows connection
- For Supabase: ensure IP is allowed in project settings

---

## What Gets Created

When you run `npm run db:push`, Prisma creates:

| Table | Purpose |
|-------|---------|
| `User` | User accounts (email, password, role, etc.) |
| `EmployeeProfile` | Employee details (targets, VBID, slab info) |
| `Team` | Teams/organizations |
| `RefreshToken` | JWT refresh tokens |
| `PasswordResetToken` | Forgot-password tokens |
| `PersonalPlacement` | Individual recruiter placements |
| `TeamPlacement` | Team lead placements |
| `PlacementImportBatch` | Import batch tracking |
| `AuditLog` | Activity logs |
| `Campaign` | Marketing campaigns |
| `CampaignTeamLead` | Campaign assignments |

Plus all **foreign keys**, **indexes**, and **constraints** defined in the schema.

---

## Next Steps After Setup

1. **Seed data (optional):**
   ```bash
   npm run db:seed
   ```

2. **Start backend:**
   ```bash
   npm run dev:backend
   ```

3. **Start frontend:**
   ```bash
   npm run dev:frontend
   ```

---

## Quick Reference

| Task | Command |
|------|---------|
| Connect + create all tables | `npm run setup` (from root) |
| Push schema only | `npm run db:push` |
| Generate Prisma client | `npm run db:generate` |
| View database in browser | `npx prisma studio` (from Backend/) |
| Reset database (⚠️ deletes all) | Drop schema + `npm run db:push` |

---

## Important Notes

- **Never commit `.env`** to git (it contains secrets)
- **Always use `.env.example`** as a template
- **For production:** Use strong JWT secrets and set `NODE_ENV=production`
- **`db push`** is for development/prototyping; use **migrations** (`prisma migrate`) for production workflows
