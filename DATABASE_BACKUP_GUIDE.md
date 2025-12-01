# Neon Database Backup Guide

This guide covers how to backup your Neon PostgreSQL database and set up automatic backups.

## 🎯 Quick Overview

**Good News:** Neon provides automatic backups! But you should also have manual backup options.

---

## 📊 Neon's Built-in Automatic Backups

### What Neon Provides Automatically:

1. **Point-in-Time Restore (PITR)** - Available on paid plans
   - Neon keeps a history of all changes
   - You can restore to any point in the last 7-30 days (depending on your plan)
   
2. **Branch History** - On all plans (including Free)
   - When you create a branch, it's essentially a backup
   - Each branch is an independent copy of your database

### Check Your Neon Backup Settings:

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to "Settings" → "Storage"
4. Check "History retention" settings

**Free Tier:** 7 days of history
**Launch/Scale Plans:** 7-30 days configurable

---

## 💾 Manual Backup Methods

### Method 1: Using pg_dump (Recommended)

This creates a complete SQL dump of your database.

#### On Windows (PowerShell):

```powershell
# Set your Neon connection string
$env:DATABASE_URL = "postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Create backup with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "backup_$timestamp.sql"

pg_dump $env:DATABASE_URL -f $backupFile

Write-Host "Backup created: $backupFile"
```

#### On Mac/Linux (Bash):

```bash
# Set your Neon connection string
export DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Create backup with timestamp
timestamp=$(date +%Y-%m-%d_%H-%M-%S)
backup_file="backup_${timestamp}.sql"

pg_dump $DATABASE_URL -f $backup_file

echo "Backup created: $backup_file"
```

### Method 2: Using Node.js Script

We've included a Node.js backup script (see `backend/src/scripts/backup-database.ts`)

---

## 🤖 Automated Backup Solutions

### Option 1: Using Vercel Cron Jobs (Recommended)

Create automatic backups that run on a schedule using Vercel Cron.

**Steps:**
1. Add the backup script to your backend
2. Create an API endpoint to trigger the backup
3. Configure Vercel Cron in `vercel.json`
4. Store backups in cloud storage (S3, Vercel Blob, etc.)

See the implementation in `backend/src/scripts/backup-database.ts` and the cron configuration below.

### Option 2: Using GitHub Actions

Set up a GitHub Action that runs daily/weekly to backup your database.

See `.github/workflows/database-backup.yml` for implementation.

### Option 3: Using Neon Branching (Simplest)

Create database branches periodically as backups:

```bash
# Install Neon CLI
npm install -g neonctl

# Authenticate
neonctl auth

# Create a backup branch
neonctl branches create --project-id your-project-id --name backup-$(date +%Y-%m-%d)
```

---

## 📦 Recommended Backup Strategy

### For Production:

1. **Neon's automatic backups** - Always enabled (your safety net)
2. **Daily automated backups** - Using Vercel Cron or GitHub Actions
3. **Weekly manual dumps** - Store locally or in cloud storage
4. **Pre-deployment snapshots** - Create a Neon branch before major changes

### Backup Schedule:
- **Hourly:** Neon's automatic PITR (built-in)
- **Daily:** Automated pg_dump via cron (uploaded to cloud)
- **Weekly:** Manual verification backup
- **Before updates:** Create Neon branch

---

## 🔄 Restoring from Backup

### Restore from SQL Dump:

```bash
# Using psql
psql $DATABASE_URL -f backup_2025-11-27.sql

# Or using pg_restore (for custom format dumps)
pg_restore -d $DATABASE_URL backup_2025-11-27.dump
```

### Restore from Neon History:

1. Go to Neon Console
2. Navigate to your project
3. Click "Restore" in the UI
4. Select the timestamp to restore to
5. Choose to restore to a new branch (recommended) or overwrite current

---

## 📁 Backup Storage Recommendations

### Local Development:
- Store in `backups/` folder (add to `.gitignore`)

### Production:
- **Vercel Blob Storage** - Easiest for Vercel apps
- **AWS S3** - Industry standard, cheap
- **Google Cloud Storage** - Good alternative
- **Dropbox/Google Drive** - For small databases

---

## ⚠️ Important Notes

1. **Never commit database backups to Git** - They may contain sensitive data
2. **Encrypt backups** - Especially if storing in cloud
3. **Test restores regularly** - A backup you can't restore is useless
4. **Keep multiple versions** - Don't overwrite old backups immediately
5. **Check backup file sizes** - Ensure they're reasonable and not corrupted

---

## 🚀 Next Steps

1. Check your Neon plan's backup retention
2. Set up the automated backup script (see below)
3. Test the backup and restore process
4. Schedule regular backups
5. Document your backup procedures

---

## 📞 Need Help?

- Neon Docs: https://neon.tech/docs/introduction
- Neon Support: https://neon.tech/docs/introduction/support
- PostgreSQL pg_dump: https://www.postgresql.org/docs/current/app-pgdump.html

