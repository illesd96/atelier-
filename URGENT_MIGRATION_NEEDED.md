# ⚠️ URGENT: Database Migration Required

## What Happened

The URL slug feature has been deployed to production, but the database migration hasn't been run yet.

**Current Status:**
- ✅ Backend code is deployed (handles slugs)
- ✅ Frontend code is deployed (uses slug in header)
- ❌ **Database migration NOT run yet** (slug column missing)

This is causing 500 errors when accessing:
```
https://www.atelier-archilles.hu/special-events/mikulas
```

---

## Quick Fix (Temporary)

I've temporarily reverted the header to use UUID instead of slug:
```javascript
// Header.tsx now uses:
const SANTA_EVENT_ID = '03748123-6228-4fbf-bd25-61ce9272e994';
```

**This will work until you run the migration.**

---

## Permanent Fix: Run Migration

### Step 1: Check if slug column exists

```bash
psql $DATABASE_URL -f CHECK_SLUG_COLUMN.sql
```

**Expected output if migration needed:**
```
column_name | data_type | is_nullable
(0 rows)
```

### Step 2: Run the migration

```bash
psql $DATABASE_URL -f backend/src/database/migrations/009-special-events-slug.sql
```

**Or in Neon Console:**
1. Go to https://console.neon.tech/
2. Select your project
3. Open SQL Editor
4. Copy content of `backend/src/database/migrations/009-special-events-slug.sql`
5. Click Run

### Step 3: Verify slug was created

```bash
psql $DATABASE_URL -f CHECK_SLUG_COLUMN.sql
```

**Expected output after migration:**
```
column_name | data_type | is_nullable
slug        | varchar   | YES
```

### Step 4: Set Santa event slug

```bash
psql $DATABASE_URL -f SET_MIKULAS_SLUG.sql
```

**Verify:**
```sql
SELECT id, name, slug FROM special_events;
```

**Expected:**
```
id                                   | name              | slug
03748123-6228-4fbf-bd25-61ce9272e994 | Mikulás Fotózás  | mikulas
```

### Step 5: Update Header to use slug

Edit `frontend/src/components/shared/Header.tsx`:

**Change from:**
```javascript
const SANTA_EVENT_ID = '03748123-6228-4fbf-bd25-61ce9272e994';
href: `/special-events/${SANTA_EVENT_ID}`
```

**To:**
```javascript
const SANTA_EVENT_SLUG = 'mikulas';
href: `/special-events/${SANTA_EVENT_SLUG}`
```

### Step 6: Deploy

```bash
git add frontend/src/components/shared/Header.tsx
git commit -m "Use slug for Santa event after migration"
git push
```

---

## Why This Happened

The code was deployed before running the database migration. This is a common deployment issue.

**Proper deployment order:**
1. ✅ Run database migration FIRST
2. ✅ Deploy backend code
3. ✅ Deploy frontend code

**What we did (incorrect):**
1. ❌ Deploy backend code
2. ❌ Deploy frontend code  
3. ❌ Database migration not run yet

---

## Current Site Status

### ✅ Working URLs
```
https://www.atelier-archilles.hu/special-events/03748123-6228-4fbf-bd25-61ce9272e994
```
(Using UUID directly works)

### ❌ Not Working URLs
```
https://www.atelier-archilles.hu/special-events/mikulas
```
(Slug doesn't work until migration is run)

### ✅ Temporary Fix Applied
The header now uses UUID, so the "Mikulás 🎅" link works.

---

## Testing After Migration

### Step 1: Test UUID URL (should still work)
```
https://www.atelier-archilles.hu/special-events/03748123-6228-4fbf-bd25-61ce9272e994
```

### Step 2: Test Slug URL (should work after migration)
```
https://www.atelier-archilles.hu/special-events/mikulas
```

### Step 3: Test Availability
```
https://www.atelier-archilles.hu/api/special-events/mikulas/availability?date=2025-12-06
```

Should return available time slots, not 500 error.

---

## Rollback Plan (if needed)

If something goes wrong with the migration:

### Rollback Database
```sql
-- Remove slug column
ALTER TABLE special_events DROP COLUMN IF EXISTS slug;

-- Remove index
DROP INDEX IF EXISTS idx_special_events_slug;
```

### Rollback Code
```bash
# Revert to previous commit
git revert HEAD
git push
```

---

## Prevention for Next Time

### Proper Deployment Checklist

**Before deploying code that requires DB changes:**

- [ ] Test migration on local/dev database
- [ ] Run migration on staging
- [ ] Test staging thoroughly
- [ ] Run migration on production
- [ ] Verify migration success
- [ ] Deploy backend code
- [ ] Test backend API
- [ ] Deploy frontend code
- [ ] Test full user flow
- [ ] Monitor for errors

### Alternative: Feature Flags

For larger changes, use feature flags:

```javascript
// Backend
if (process.env.ENABLE_SLUG_FEATURE === 'true') {
  // Use slug logic
} else {
  // Use UUID logic
}
```

This allows deploying code without immediately enabling the feature.

---

## Summary

### Current Situation
- ⚠️ URL slug feature partially deployed
- ❌ Database migration not run
- ✅ Temporary fix applied (using UUID)
- ✅ Site is working (using UUID URLs)

### Action Required
1. **Run migration:** `009-special-events-slug.sql`
2. **Set slug:** `SET_MIKULAS_SLUG.sql`
3. **Update header:** Use `SANTA_EVENT_SLUG`
4. **Deploy:** Push updated header
5. **Test:** Verify slug URLs work

### Timeline
- **Now:** Site works with UUID
- **After migration:** Site works with both UUID and slug
- **After header update:** Site uses slug by default

---

## Quick Commands

```bash
# 1. Check if migration needed
psql $DATABASE_URL -f CHECK_SLUG_COLUMN.sql

# 2. Run migration
psql $DATABASE_URL -f backend/src/database/migrations/009-special-events-slug.sql

# 3. Set Santa slug
psql $DATABASE_URL -f SET_MIKULAS_SLUG.sql

# 4. Verify
psql $DATABASE_URL -c "SELECT id, name, slug FROM special_events;"

# 5. Update code and deploy
# (Edit Header.tsx to use slug)
git push
```

---

## Need Help?

If you encounter any issues:

1. Check error logs in Vercel dashboard
2. Run `CHECK_SLUG_COLUMN.sql` to see current state
3. Verify the migration script completed successfully
4. Test both UUID and slug URLs

---

**Priority:** Run the migration ASAP to enable the slug feature fully! 🚀

