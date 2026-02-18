# SQL Server Testing Setup (Free)

Quick guide to test SQL Server migration locally using Docker.

## Option 1: Docker SQL Server (Recommended for Testing)

### Prerequisites
- Docker Desktop installed: https://www.docker.com/products/docker-desktop

### Setup Steps

1. **Start SQL Server container:**
   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" -e "MSSQL_PID=Express" -p 1433:1433 --name sqlserver-test -d mcr.microsoft.com/mssql/server:2022-latest
   ```

2. **Connection string for testing:**
   ```
   sqlserver://localhost:1433;database=master;user=sa;password=YourStrong@Passw0rd;trustServerCertificate=true
   ```

3. **Update `Backend/.env` temporarily:**
   ```env
   DATABASE_URL=sqlserver://localhost:1433;database=ritwil_test;user=sa;password=YourStrong@Passw0rd;trustServerCertificate=true
   ```

4. **Test connection:**
   ```bash
   cd Backend
   npm run db:push
   ```

5. **Stop container when done:**
   ```bash
   docker stop sqlserver-test
   docker rm sqlserver-test
   ```

---

## Option 2: Azure SQL Database Free Tier

### Setup Steps

1. **Create Azure account** (if you don't have one)
   - Go to: https://azure.microsoft.com/free/
   - Get $200 free credits (valid 30 days)

2. **Create Azure SQL Database:**
   - Azure Portal → Create Resource → Azure SQL Database
   - **Server:** Create new server
   - **Compute:** Basic tier (cheapest, ~$5/month, but free with credits)
   - **Database name:** `ritwil-test`
   - **Authentication:** SQL authentication

3. **Connection string format:**
   ```
   sqlserver://SERVER_NAME.database.windows.net:1433;database=ritwil-test;user=USERNAME;password=PASSWORD;encrypt=true;trustServerCertificate=false
   ```

4. **Important:** Set firewall rules to allow your IP:
   - Azure Portal → SQL Server → Networking → Add your IP

---

## Option 3: SQL Server Express (Local Installation)

### Download & Install

1. **Download:** https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. **Choose:** "Express" edition (free)
3. **Install** with default settings
4. **Set SA password** during installation

### Connection String
```
sqlserver://localhost:1433;database=ritwil_test;user=sa;password=YourPassword;trustServerCertificate=true
```

---

## Testing Migration Steps

1. **Backup your PostgreSQL data** (from Supabase)
   ```bash
   # Export data from Supabase
   pg_dump "your-supabase-connection-string" > backup.sql
   ```

2. **Change Prisma schema** (temporarily for testing):
   ```prisma
   datasource db {
     provider = "sqlserver"
     url      = env("DATABASE_URL")
   }
   ```

3. **Generate Prisma client:**
   ```bash
   cd Backend
   npm run prisma:generate
   ```

4. **Push schema to SQL Server:**
   ```bash
   npm run db:push
   ```

5. **Test your application:**
   ```bash
   npm run dev
   ```

6. **Revert when done testing:**
   - Change schema back to `postgresql`
   - Update `.env` back to Supabase connection string
   - Regenerate Prisma client

---

## Comparison: Free SQL Server Options

| Option | Setup Time | Cost | Best For |
|--------|------------|------|----------|
| **Docker SQL Server** | 5 minutes | Free | Quick testing, easy reset |
| **SQL Server Express** | 30 minutes | Free | Long-term local dev |
| **Azure SQL (Basic)** | 15 minutes | Free* | Cloud testing (*with credits) |

**Recommendation:** Use **Docker SQL Server** for quick testing. It's fastest to set up and easiest to reset.
