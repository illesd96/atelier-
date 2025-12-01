# How to Update the Santa (Mikulás) Link in Header

## 🎅 Quick Steps

The "Mikulás 🎅" link has been added to your header navigation, but you need to update it with your actual event ID after creating the Santa event.

### Step 1: Run the Database Setup

```bash
# Run the SQL setup script
psql $DATABASE_URL -f SETUP_SPECIAL_EVENTS.sql
```

### Step 2: Deploy Your Code

```bash
# Deploy to Vercel
vercel --prod
```

### Step 3: Create the Santa Event

1. Go to your admin panel: `https://your-domain.com/admin/special-events`
2. Click **"Új Esemény"** (New Event)
3. Fill in the form:

```
Név: Mikulás Fotózás 2025
Leírás: Professzionális fotózás Mikulással!
Terem: Atelier
Kezdő dátum: 2025-12-05
Befejező dátum: 2025-12-06
Kezdés: 08:00
Befejezés: 20:00
Időköz: 15 perc
Ár: 15,000 Ft
Aktív: ✓ Checked
```

4. Click **"Mentés"** (Save)

### Step 4: Copy the Event ID

After saving, you'll see the event in the table. Look for the **ID** column (it's a UUID like `a1b2c3d4-e5f6-...`).

**To see the full ID:**
- Hover over the row
- Or click the edit button to see it in the URL
- The URL will be: `/admin/special-events` and the ID will be in the table

**To copy the ID easily:**
- Open your browser's developer console (F12)
- Go to the Network tab
- Look for the API response that shows the full event object
- Or use this SQL query in Neon:

```sql
SELECT id, name FROM special_events WHERE name LIKE '%Mikulás%';
```

### Step 5: Update the Header

Open `frontend/src/components/shared/Header.tsx` and find this line (around line 20):

```typescript
const SANTA_EVENT_ID = 'YOUR-EVENT-ID-HERE';
```

Replace `'YOUR-EVENT-ID-HERE'` with your actual event ID:

```typescript
const SANTA_EVENT_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
```

### Step 6: Deploy Again

```bash
# Commit the changes
git add frontend/src/components/shared/Header.tsx
git commit -m "Update Santa event ID"
git push

# Deploy
vercel --prod
```

---

## ✅ Verification

After deployment, the header should show:
- **Hungarian:** "Mikulás 🎅"
- **English:** "Santa 🎅"

Clicking it will take users directly to your Santa photo booking page!

---

## 🎯 Alternative: Get Event ID Programmatically

If you want to see the event ID immediately after creation, add this to your admin page console:

```javascript
// In the admin special events page, after creating an event
console.table(events.map(e => ({ name: e.name, id: e.id })));
```

Or use the API:

```bash
# Get all events
curl https://your-domain.com/api/special-events

# Look for your Santa event in the response
```

---

## 💡 Pro Tip: Dynamic Event Link

If you want the link to automatically point to the active Santa event without hardcoding the ID, you can create a redirect route. Let me know if you'd like me to implement this!

---

## 🎄 Current Header Structure

```
┌─────────────────────────────────────────────────────┐
│  🏠 Főoldal | 🏢 Szobák | 🎅 Mikulás | ❓ GYIK | 📞 Kapcsolat │
└─────────────────────────────────────────────────────┘
```

The Mikulás link appears between "Szobák" and "GYIK" for maximum visibility!

---

**Need help? Check the event ID in:**
- Admin table UI
- Browser Network tab
- Database query (shown above)
- API response at `/api/special-events`

