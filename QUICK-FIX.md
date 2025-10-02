# Quick Fix Guide

## 🚨 Fixing the Current Errors

### 1. Database Setup Issue

The error shows the backend can't connect to PostgreSQL. Here's how to fix it:

**Step 1: Create the database**
```bash
# Create PostgreSQL database
createdb photo_studio
```

**Step 2: Configure environment**
```bash
# Copy environment file
cp backend/env.example backend/.env

# Edit backend/.env and set:
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/photo_studio
```

**Step 3: Set up database schema**
```bash
# Run the automated database setup
npm run db:setup
```

### 2. Email Service Fix

The nodemailer error has been fixed in the code. The method name was corrected from `createTransporter` to `createTransport`.

## 🚀 Complete Setup Process

Run these commands in order:

```bash
# 1. Install all dependencies
npm run install:all

# 2. Create PostgreSQL database
createdb photo_studio

# 3. Copy and configure environment
cp backend/env.example backend/.env
# Edit backend/.env with your database credentials

# 4. Set up database schema
npm run db:setup

# 5. Start the application
npm run dev
```

## 🔧 Environment Configuration

Make sure your `backend/.env` contains:

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://username:password@localhost:5432/photo_studio

# Email (Optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourstudio.com
FROM_NAME=Photo Studio

# Barion (Optional for development)
BARION_ENVIRONMENT=test
BARION_POS_KEY=your_barion_pos_key

# Studios (Already configured)
STUDIOS='[{"id":"studio-a","name":"Studio A"},{"id":"studio-b","name":"Studio B"},{"id":"studio-c","name":"Studio C"},{"id":"makeup","name":"Makeup Studio"}]'
```

## 📊 Database Troubleshooting

If you get database connection errors:

1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   pg_ctl status
   
   # macOS/Linux
   brew services list | grep postgresql
   ```

2. **Check database exists:**
   ```bash
   psql -l | grep photo_studio
   ```

3. **Test connection:**
   ```bash
   psql postgresql://username:password@localhost:5432/photo_studio
   ```

4. **Common fixes:**
   - Make sure PostgreSQL service is running
   - Check username/password are correct
   - Ensure database `photo_studio` exists
   - Verify port 5432 is not blocked

## 🎯 Quick Test

After setup, test the system:

1. **Backend health check:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Frontend access:**
   Open http://localhost:3000

3. **Database test:**
   ```bash
   # Should return studio data
   curl http://localhost:3001/api/availability?date=2025-01-15
   ```

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Backend starts without errors
- ✅ Frontend loads the booking page
- ✅ Calendar shows available time slots
- ✅ You can add slots to cart
- ✅ No console errors in browser

## 🆘 Still Having Issues?

1. Check the console logs for specific error messages
2. Verify all environment variables are set
3. Make sure PostgreSQL is running and accessible
4. Try restarting the development servers
