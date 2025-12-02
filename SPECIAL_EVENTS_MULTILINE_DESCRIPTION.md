# Multi-Line Descriptions for Special Events

## ✅ Now Enabled!

You can now use multi-line descriptions for special events. Line breaks will be preserved and displayed correctly on the booking page.

---

## 📝 How to Use

### In the Admin Panel

1. Go to **Admin Dashboard** → **Special Events**
2. Click **Create New Event** or **Edit** an existing event
3. In the **"Leírás"** (Description) field:
   - Type your description
   - **Press Enter to create a new line**
   - Continue typing
   - Press Enter again for more lines

**Example:**
```
Készíts varázslatos karácsonyi fotókat egy élő Mikulással!

A csomag tartalma:
- 15 perces fotózás
- 5 db szerkesztett kép
- Professzionális beállítás
- Téli mesebeli háttér

Foglalj időpontot most!
```

### In the Database (SQL)

If you're updating directly via SQL, use actual newlines in your text:

```sql
UPDATE special_events
SET description = 'Készíts varázslatos karácsonyi fotókat egy élő Mikulással!

A csomag tartalma:
- 15 perces fotózás
- 5 db szerkesztett kép
- Professzionális beállítás
- Téli mesebeli háttér

Foglalj időpontot most!'
WHERE id = '03748123-6228-4fbf-bd25-61ce9272e994';
```

Or use `\n` (newline character) if your SQL client doesn't support multi-line strings:

```sql
UPDATE special_events
SET description = E'Készíts varázslatos karácsonyi fotókat egy élő Mikulással!\n\nA csomag tartalma:\n- 15 perces fotózás\n- 5 db szerkesztett kép\n- Professzionális beállítás\n- Téli mesebeli háttér\n\nFoglalj időpontot most!'
WHERE id = '03748123-6228-4fbf-bd25-61ce9272e994';
```

**Note:** The `E` before the string enables escape sequences in PostgreSQL.

---

## 🎨 How It Looks

### Before:
```
Készíts varázslatos karácsonyi fotókat egy élő Mikulással, egy mesebeli, havas téli erdő közepén!
```
*(All in one line)*

### After:
```
Készíts varázslatos karácsonyi fotókat egy élő Mikulással!

A csomag tartalma:
- 15 perces fotózás
- 5 db szerkesztett kép
- Professzionális beállítás
- Téli mesebeli háttér

Foglalj időpontot most!
```
*(Multiple lines with proper spacing)*

---

## 🔧 Technical Details

### What Changed

#### Frontend Display (`SpecialEventBookingPage.css`)
Added `white-space: pre-line` to `.event-description`:
```css
.event-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  white-space: pre-line; /* Preserve line breaks */
  line-height: 1.6;
}
```

**What `white-space: pre-line` does:**
- Preserves line breaks from the text
- Collapses multiple spaces into one
- Wraps text normally

#### Admin Form (`SpecialEventsPage.tsx`)
Improved the textarea:
- Increased from 3 to 5 rows
- Added minimum height (120px)
- Added helpful tip about using Enter for new lines

---

## 💡 Best Practices

### Formatting Tips

**Good:**
```
Brief introduction paragraph.

Key points:
- Point 1
- Point 2
- Point 3

Call to action!
```

**Better:**
```
🎅 Készíts varázslatos karácsonyi fotókat!

📦 A csomag tartalma:
• 15 perces fotózás
• 5 db szerkesztett kép
• Mesebeli téli háttér

📞 Foglalj most: +36 30 974 7362
```

### Length Guidelines
- **First paragraph:** 1-2 lines (attention grabber)
- **Details:** 3-6 bullet points
- **Call to action:** 1 line
- **Total:** Keep under 10-12 lines

### Spacing
- Use one blank line between paragraphs
- Don't use more than one blank line
- Use bullet points (•, -, *) for lists

---

## 🚀 Quick Update Example

Want to update your existing Santa event description?

### Option 1: Through Admin Panel
1. Go to **Admin → Special Events**
2. Click **Edit** on "Mikulás Fotózás"
3. Update the description field:
```
Készíts varázslatos karácsonyi fotókat egy élő Mikulással!

📦 A csomag tartalma:
• 15 perces fotózás
• 5 db profi szerkesztett kép
• Mesebeli, havas téli erdő háttér
• Személyre szabott élmény

🎁 Tökéletes ajándék a családnak!
📸 Foglalj időpontot most!
```
4. Click **Save**

### Option 2: Direct SQL Update
```sql
UPDATE special_events
SET description = E'Készíts varázslatos karácsonyi fotókat egy élő Mikulással!\n\n📦 A csomag tartalma:\n• 15 perces fotózás\n• 5 db profi szerkesztett kép\n• Mesebeli, havas téli erdő háttér\n• Személyre szabott élmény\n\n🎁 Tökéletes ajándék a családnak!\n📸 Foglalj időpontot most!'
WHERE name = 'Mikulás Fotózás';
```

---

## ❌ What NOT to Use

### Don't Use HTML Tags
❌ **Don't:** `Első sor<br>Második sor<br><br>Harmadik sor`
✅ **Do:** Use actual line breaks (Enter key)

### Don't Use Special Characters
❌ **Don't:** `\r\n` or `\r` (Windows line endings)
✅ **Do:** Use `\n` (Unix line endings) or actual Enter key

### Don't Use Excessive Spacing
❌ **Don't:**
```
Line 1


Line 2



Line 3
```
✅ **Do:**
```
Line 1

Line 2

Line 3
```

---

## 🧪 Testing

After updating a description:

1. **Check the admin panel:**
   - Does it show line breaks in the edit form?
   - ✅ Yes = Good!

2. **Check the booking page:**
   - Go to the special event booking page
   - Does the description show multiple lines?
   - ✅ Yes = Working!

3. **Test on mobile:**
   - View on a small screen
   - Does text wrap properly?
   - ✅ Yes = Perfect!

---

## 🔍 Troubleshooting

### Line breaks not showing on booking page

**Problem:** Description still shows as one line

**Solutions:**
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Check CSS:** Verify `white-space: pre-line` is in `SpecialEventBookingPage.css`
4. **Rebuild:** Run `npm run build` and redeploy

### Line breaks not preserved in admin form

**Problem:** When editing, line breaks disappear

**Solutions:**
1. **Check your database:** Make sure `\n` is actually stored
2. **Update via SQL:** Use the `E'...\n...'` syntax
3. **Re-enter in admin panel:** Copy text, edit event, paste text

### Too much spacing on page

**Problem:** Too many blank lines between paragraphs

**Solution:**
- Reduce blank lines in the description
- Use only ONE blank line between paragraphs

---

## 📊 Summary

### What Works Now ✅
- ✅ Press Enter in admin form for new lines
- ✅ Line breaks preserved in database
- ✅ Line breaks displayed on booking page
- ✅ Text wraps properly on mobile
- ✅ Clean, readable multi-line descriptions

### What Doesn't Work ❌
- ❌ HTML tags (`<br>`, `<p>`, etc.)
- ❌ Custom formatting (bold, italic)
- ❌ Images in description
- ❌ Links in description

### Future Enhancements 💡
If you need richer formatting later, we can:
- Add Markdown support
- Add WYSIWYG editor
- Add image attachments
- Add custom styling options

---

## 🎉 You're All Set!

Now you can create beautiful, well-formatted multi-line descriptions for your special events!

**Next steps:**
1. Update your Santa event description
2. Test it on the booking page
3. Create more special events with great descriptions!

Happy formatting! 🎅✨

