# Database Backup - Quick Start Guide

Quick reference for backing up your Neon PostgreSQL database.

## 🎯 Summary

**Yes, Neon has automatic backups!** But you should also have manual backup options.

---

## ✅ What's Already Set Up

1. **Neon's Automatic Backups** - Already active!
   - 7 days of point-in-time restore (Free tier)
   - Access via Neon Console → Your Project → Settings

2. **Vercel Cron Backup** (NEW) - Runs daily at 2 AM
   - Configured in `vercel.json`
   - Triggers `/api/cron/backup` endpoint
   - Requires `CRON_SECRET` environment variable

3. **GitHub Actions Backup** (Optional)
   - Runs daily at 2 AM UTC
   - Stores backups as artifacts for 30 days
   - Can be triggered manually from GitHub

---

## 🚀 Quick Start - Manual Backup

### Option 1: Windows PowerShell

```powershell
# Set your database URL (get from Neon Console)
$env:DATABASE_URL = "your-neon-connection-string"

# Run the backup script
.\scripts\backup-manual.ps1
```

### Option 2: Mac/Linux

```bash
# Set your database URL
export DATABASE_URL="your-neon-connection-string"

# Make script executable
chmod +x scripts/backup-manual.sh

# Run the backup
./scripts/backup-manual.sh
```

### Option 3: Direct pg_dump

```bash
# Windows PowerShell
pg_dump $env:DATABASE_URL -f backup_$(Get-Date -Format "yyyy-MM-dd").sql

# Mac/Linux
pg_dump "$DATABASE_URL" -f "backup_$(date +%Y-%m-%d).sql"
```

---

## ⚙️ Setup Automatic Backups

### Enable Vercel Cron Backup:

1. **Set CRON_SECRET in Vercel:**
   ```bash
   vercel env add CRON_SECRET
   # Enter a strong random secret
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Verify in Vercel Dashboard:**
   - Go to Project → Settings → Cron Jobs
   - You should see: `/api/cron/backup?secret=$CRON_SECRET`
   - Schedule: `0 2 * * *` (daily at 2 AM)

### Enable GitHub Actions Backup:

1. **Add DATABASE_URL to GitHub Secrets:**
   - Go to Repository → Settings → Secrets → Actions
   - Add secret: `DATABASE_URL` with your Neon connection string

2. **The workflow is already set up!**
   - Check `.github/workflows/database-backup.yml`
   - Runs automatically every day at 2 AM UTC
   - Can be triggered manually from Actions tab

---

## 📥 How to Get Your Database URL

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click "Connection Details"
4. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

---

## 🔄 Restoring from Backup

### Restore to Production:

```bash
# WARNING: This will overwrite your current database!
psql "$DATABASE_URL" -f backup_2025-11-27.sql
```

### Restore to a New Neon Branch (Recommended):

1. Create a new branch in Neon Console
2. Get the new branch's connection string
3. Restore to the new branch:
   ```bash
   psql "$NEW_BRANCH_URL" -f backup_2025-11-27.sql
   ```
4. Test the restored data
5. If good, promote the branch to main

---

## 🗓️ Recommended Backup Schedule

| Frequency | Method | Retention |
|-----------|--------|-----------|
| Continuous | Neon PITR | 7 days (automatic) |
| Daily | Vercel Cron | 7-30 days |
| Daily | GitHub Actions | 30 days |
| Weekly | Manual Download | Forever (your storage) |
| Before Deploy | Neon Branch | Until deleted |

---

## 📊 Check Backup Status

### Check Neon's Built-in Backups:
1. Go to Neon Console
2. Your Project → Settings → Storage
3. View "History retention" settings

### Check Vercel Cron Status:
```bash
# View logs in Vercel Dashboard
# Project → Deployments → (latest) → Functions → /api/cron/backup
```

### Check GitHub Actions:
- Go to repository → Actions tab
- View "Database Backup" workflow runs

---

## 🆘 Troubleshooting

### "pg_dump: command not found"

**Fix:**
- **Windows:** Install PostgreSQL from https://www.postgresql.org/download/windows/
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql-client`

### "DATABASE_URL is not set"

**Fix:**
```bash
# Windows
$env:DATABASE_URL = "your-connection-string"

# Mac/Linux
export DATABASE_URL="your-connection-string"
```

### "Backup file is empty or too small"

**Possible causes:**
1. Database connection failed
2. No data in database
3. Insufficient permissions

**Fix:** Check connection string and database permissions

---

## 📁 Where Backups Are Stored

| Method | Location | Cleanup |
|--------|----------|---------|
| Neon PITR | Neon (automatic) | Automatic |
| Manual script | `./backups/` folder | Manual |
| Vercel Cron | Local temp (need cloud upload) | Script cleans >7 days |
| GitHub Actions | GitHub Artifacts | Auto-delete after 30 days |

---

## 🔒 Security Tips

1. **Never commit backups to Git** - Add `/backups/` to `.gitignore`
2. **Encrypt sensitive backups** - Especially if storing in cloud
3. **Rotate secrets regularly** - Change CRON_SECRET periodically
4. **Test restore process** - Backup is useless if you can't restore!
5. **Keep backups in multiple locations** - Don't rely on just one method

---

## 💡 Pro Tips

1. **Create a branch before major changes:**
   ```bash
   neonctl branches create --name pre-migration-backup
   ```

2. **Automate backup uploads to cloud storage** - Modify scripts to upload to S3/GCS

3. **Set up monitoring** - Get notified if backups fail

4. **Document your restore process** - Future you will thank present you!

5. **Test restores regularly** - Schedule quarterly restore tests

---

## 📚 Additional Resources

- **Full Guide:** See `DATABASE_BACKUP_GUIDE.md`
- **Neon Docs:** https://neon.tech/docs/introduction
- **PostgreSQL Backup:** https://www.postgresql.org/docs/current/backup.html
- **Vercel Cron:** https://vercel.com/docs/cron-jobs

---

## 🎉 You're All Set!

You now have multiple backup methods:
- ✅ Automatic (Neon)
- ✅ Scheduled (Vercel Cron / GitHub Actions)
- ✅ Manual (Scripts)

**Next Step:** Run a test backup to make sure everything works!

