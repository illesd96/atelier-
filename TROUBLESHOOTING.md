# Troubleshooting Guide

## 🚨 500 Internal Server Error on `/api/availability`

This error typically occurs when the database is not properly set up or connected.

### Quick Diagnosis

1. **Check backend health:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Expected response:**
   ```json
   {
     "status": "ok",
     "database": "connected"
   }
   ```

3. **If you get database error:**
   ```json
   {
     "status": "error",
     "database": "disconnected",
     "error": "connection refused"
   }
   ```

### Fix Steps

#### Step 1: Check PostgreSQL is Running
```bash
# Check if PostgreSQL is running
# Windows
pg_ctl status

# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

#### Step 2: Create Database
```bash
# Create the database
createdb photo_studio
```

#### Step 3: Configure Environment
```bash
# Make sure backend/.env exists with correct DATABASE_URL
cp backend/env.example backend/.env

# Edit backend/.env and set:
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/photo_studio
```

#### Step 4: Set Up Database Schema
```bash
# Run the automated setup
npm run db:setup
```

#### Step 5: Restart Backend
```bash
# Stop the backend (Ctrl+C) and restart
npm run dev:backend
```

### Common Issues

#### Issue: "database does not exist"
**Solution:** Create the database first
```bash
createdb photo_studio
```

#### Issue: "password authentication failed"
**Solution:** Check your username/password in DATABASE_URL
```bash
# Test connection manually
psql postgresql://username:password@localhost:5432/photo_studio
```

#### Issue: "connection refused"
**Solution:** PostgreSQL is not running
```bash
# Start PostgreSQL
# Windows: Start PostgreSQL service
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

#### Issue: "tables do not exist"
**Solution:** Run database setup
```bash
npm run db:setup
```

### Manual Database Setup

If the automated setup fails, you can set up manually:

```bash
# 1. Connect to your database
psql postgresql://username:password@localhost:5432/photo_studio

# 2. Run the schema
\i backend/src/database/schema.sql

# 3. Check tables were created
\dt

# 4. Exit
\q
```

### Verify Everything Works

1. **Test database connection:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Test availability endpoint:**
   ```bash
   curl "http://localhost:3001/api/availability?date=2025-01-15"
   ```

3. **Expected availability response:**
   ```json
   {
     "date": "2025-01-15",
     "rooms": [
       {
         "id": "studio-a",
         "name": "Studio A",
         "slots": [
           {"time": "08:00", "status": "available"},
           {"time": "09:00", "status": "available"}
         ]
       }
     ]
   }
   ```

### Still Having Issues?

1. **Check backend logs** for specific error messages
2. **Verify environment variables** in `backend/.env`
3. **Test database connection** manually with `psql`
4. **Check PostgreSQL logs** for connection issues

### Environment Checklist

Make sure your `backend/.env` has:
```env
# Required
DATABASE_URL=postgresql://username:password@localhost:5432/photo_studio

# Optional (can be empty for development)
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
BARION_POS_KEY=
```

### Development vs Production

**Development:**
- Database: Local PostgreSQL
- All external services are optional
- Focus on getting basic functionality working

**Production:**
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- Configure all environment variables
- Enable SSL connections
