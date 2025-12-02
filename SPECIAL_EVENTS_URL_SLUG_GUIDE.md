# Special Events URL Slug Feature

## ✅ Now You Can Use Friendly URLs!

Instead of ugly UUID URLs like:
```
https://www.atelier-archilles.hu/special-events/03748123-6228-4fbf-bd25-61ce9272e994
```

You can now use beautiful, SEO-friendly URLs like:
```
https://www.atelier-archilles.hu/special-events/mikulas
```

---

## 🚀 How to Use

### **Option 1: In the Admin Panel (Recommended)**

1. Go to **Admin Dashboard → Special Events**
2. Click **Create New Event** or **Edit** an existing event
3. Find the **"URL Slug"** field (below description)
4. Enter a friendly URL slug:
   - ✅ Examples: `mikulas`, `karacsony`, `husvet-fotozas`
   - ❌ Don't use: `Mikulás`, `Karácsonyi Fotózás` (uppercase/spaces)

5. Click **Save**

**The field will automatically:**
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Show you a preview: `/special-events/mikulas`

### **Option 2: Using SQL**

Run the migration script to add the slug column:

```bash
psql $DATABASE_URL -f backend/src/database/migrations/009-special-events-slug.sql
```

Or update manually:

```sql
-- Update Santa event slug
UPDATE special_events
SET slug = 'mikulas'
WHERE name = 'Mikulás Fotózás';
```

---

## 📝 Slug Rules

### ✅ Valid Slugs
- `mikulas` ✓
- `karacsony-2025` ✓
- `husvet-fotozas` ✓
- `tavaszi-mini-szessziok` ✓

### ❌ Invalid Slugs
- `Mikulás` ✗ (uppercase)
- `karácsonyi fotózás` ✗ (spaces, special chars)
- `Húsvét 2025` ✗ (spaces, uppercase, special chars)
- `mikulas!` ✗ (special character)

### Auto-Conversion
The admin form automatically converts invalid input:
- `Mikulás Fotózás` → `mikulas-fotozas`
- `Karácsonyi     mini` → `karacsony-mini`
- `húsvét 2025!` → `husvet-2025`

---

## 🎯 Benefits

### SEO Improvements
- ✅ Better search engine rankings
- ✅ Keywords in URL (`/mikulas` vs `/03748123-...`)
- ✅ More clickable in search results
- ✅ Easier to remember and share

### User Experience
- ✅ Clean, readable URLs
- ✅ Easy to type and share
- ✅ Professional appearance
- ✅ Social media friendly

### Technical
- ✅ Backward compatible (old UUID URLs still work)
- ✅ Unique slugs (database enforced)
- ✅ Fast lookups (indexed in database)

---

## 🔧 How It Works

### Backend
1. **Database:** Added `slug` column to `special_events` table
2. **API:** Updated endpoint to accept both UUID and slug
3. **Validation:** Ensures slug format is correct
4. **Uniqueness:** Database constraint prevents duplicate slugs

### Frontend
1. **Admin Form:** Added slug input field with auto-formatting
2. **Routing:** Updated to use slug in URLs
3. **Header:** Santa link uses `mikulas` instead of UUID

### URL Resolution
```javascript
// Both URLs work:
/special-events/03748123-6228-4fbf-bd25-61ce9272e994  // UUID (old)
/special-events/mikulas                                 // Slug (new)

// Backend automatically detects which one you're using
```

---

## 📊 Migration Steps

### Step 1: Run Database Migration

```bash
# On your database
psql $DATABASE_URL -f backend/src/database/migrations/009-special-events-slug.sql
```

This will:
- Add `slug` column to `special_events` table
- Create index for fast lookups
- Auto-generate slugs for existing events
- Set Santa event slug to `mikulas`

### Step 2: Update Frontend

The frontend code has already been updated:
- Admin form includes slug input
- Header uses `mikulas` slug
- Booking page handles both UUID and slug

### Step 3: Test

1. **Check the database:**
```sql
SELECT id, name, slug FROM special_events;
```

2. **Test the old URL (should still work):**
```
https://www.atelier-archilles.hu/special-events/03748123-6228-4fbf-bd25-61ce9272e994
```

3. **Test the new URL:**
```
https://www.atelier-archilles.hu/special-events/mikulas
```

4. **Test in admin panel:**
   - Edit an event
   - Change the slug
   - Save and verify URL works

---

## 🎨 Examples

### Creating a Christmas Event

**Admin Form:**
```
Name: Karácsonyi Mini Szessziók
Description: Rövid, 10 perces karácsonyi fotók...
URL Slug: karacsony-mini

→ URL: /special-events/karacsony-mini
```

### Creating an Easter Event

**Admin Form:**
```
Name: Húsvéti Családi Fotózás
Description: Tavaszi húsvéti fotózás...
URL Slug: husvet-csaladi

→ URL: /special-events/husvet-csaladi
```

### Creating a Valentine's Event

**Admin Form:**
```
Name: Valentin-napi Páros Fotózás
Description: Romantikus fotózás pároknak...
URL Slug: valentin

→ URL: /special-events/valentin
```

---

## ⚠️ Important Notes

### Slug Uniqueness
Each slug must be unique. If you try to use a slug that already exists:
```
Error: "This URL slug is already in use. Please choose a different one."
```

### Changing Slugs
- You can change a slug at any time
- Old links with the UUID will still work
- Consider the SEO impact of changing established URLs
- Use 301 redirects if changing popular event slugs

### Optional Field
- Slug is optional
- If not provided, use UUID in URLs (backward compatible)
- We recommend always providing a slug for better URLs

---

## 🧪 Testing Checklist

### Database
- [x] Slug column added
- [x] Index created
- [x] Unique constraint works
- [x] Santa event has `mikulas` slug

### Backend API
- [x] `/api/special-events/mikulas` works
- [x] `/api/special-events/[UUID]` still works
- [x] Create event with slug works
- [x] Update event slug works
- [x] Duplicate slug validation works

### Frontend
- [x] Admin form shows slug field
- [x] Auto-formatting works
- [x] Validation messages display
- [x] Header uses `mikulas` slug
- [x] Booking page works with slug
- [x] Booking page works with UUID

### User Experience
- [x] URLs are clean and readable
- [x] Social sharing works
- [x] Search engines can crawl
- [x] Mobile sharing is easy

---

## 📈 SEO Impact

### Before
```
URL: /special-events/03748123-6228-4fbf-bd25-61ce9272e994
Search: "mikulás fotózás budapest" - harder to rank
```

### After
```
URL: /special-events/mikulas
Search: "mikulás fotózás budapest" - better ranking!
```

### Why It's Better
1. **Keywords in URL** - search engines see "mikulas"
2. **Readable URLs** - users trust clean links
3. **Click-through rate** - prettier links get more clicks
4. **Social sharing** - looks professional on Facebook/Instagram

---

## 🔄 URL Redirect Strategy (Optional)

If you want to redirect old UUID URLs to new slug URLs:

```javascript
// In frontend routing or server
if (isUUID(url)) {
  // Fetch event to get slug
  const event = await getEvent(url);
  if (event.slug) {
    redirect(`/special-events/${event.slug}`, 301); // Permanent redirect
  }
}
```

This is optional but recommended for SEO after slugs are established.

---

## 💡 Best Practices

### Naming Conventions
- **Short and descriptive:** `mikulas` not `mikulas-fotozas-2025-dec-6-7`
- **Use Hungarian:** `mikulas` not `santa` (for Hungarian site)
- **Avoid dates:** `mikulas` not `mikulas-2025` (reuse for next year)
- **Be specific:** `karacsony-mini` not just `karacsony`

### When to Use Slugs
- ✅ All public special events
- ✅ Recurring annual events (Santa, Easter, etc.)
- ✅ Marketing campaigns
- ✅ Events you'll share on social media
- ❌ Internal test events
- ❌ One-time private bookings

### Maintenance
- Review slugs annually
- Keep popular slugs consistent
- Update marketing materials with new URLs
- Monitor analytics for URL performance

---

## 🎉 Summary

### What You Have Now
- ✅ User-friendly URLs (`/mikulas` vs `/UUID`)
- ✅ Better SEO rankings
- ✅ Easier social sharing
- ✅ Professional appearance
- ✅ Backward compatible (old URLs still work)

### Quick Start
1. Run migration: `009-special-events-slug.sql`
2. Edit your Santa event in admin
3. Confirm slug is `mikulas`
4. Share the new URL: `https://www.atelier-archilles.hu/special-events/mikulas`

### Next Steps
1. Update all special events with slugs
2. Share new URLs on social media
3. Update marketing materials
4. Monitor SEO improvements

---

## 📞 Support

### Common Issues

**Q: Old URL doesn't work**
A: Make sure migration ran successfully. Both UUID and slug URLs should work.

**Q: Slug validation error**
A: Use only lowercase letters, numbers, and hyphens. No spaces or special characters.

**Q: Can't save duplicate slug**
A: Each slug must be unique. Choose a different one or add a suffix (`mikulas-2025`).

**Q: How to change an existing slug?**
A: Edit the event in admin panel, change the slug field, and save.

---

Happy SEO optimization! 🚀

