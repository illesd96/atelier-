# Remove "Foglalási azonosító" from Invoice Bottom

## Change Summary

Removed the "Foglalási azonosító" (Booking ID) line from the bottom of Szamlazz.hu invoices since individual booking IDs are now shown in each line item.

## Before

**Invoice line items:**
```
Frigyes foglalás - 2025. nov. 12. 15:00-16:00 (BK-1762871564108-6kxfzdssi)
Karinthy foglalás - 2025. nov. 12. 15:00-16:00 (BK-1762871564113-pqg6d29uu)
Karinthy foglalás - 2025. nov. 12. 14:00-15:00 (BK-1762871564118-69uyprx6n)
Atelier foglalás - 2025. nov. 12. 15:00-16:00 (BK-1762871564122-vz9gu33ju)
```

**At the bottom:**
```
Foglalási azonosító: 9bf0b7ba-85b5-4a1d-9b89-79eb0d995ee7
Rendelésszám: 9bf0b7ba-85b5-4a1d-9b89-79eb0d995ee7
```

❌ **Problem**: The booking ID (order ID) was shown at the bottom even though each booking now has its own ID in the description.

## After

**Invoice line items:**
```
Frigyes foglalás - 2025. nov. 12. 15:00-16:00 (BK-1762871564108-6kxfzdssi)
Karinthy foglalás - 2025. nov. 12. 15:00-16:00 (BK-1762871564113-pqg6d29uu)
Karinthy foglalás - 2025. nov. 12. 14:00-15:00 (BK-1762871564118-69uyprx6n)
Atelier foglalás - 2025. nov. 12. 15:00-16:00 (BK-1762871564122-vz9gu33ju)
```

**At the bottom:**
```
Rendelésszám: 9bf0b7ba-85b5-4a1d-9b89-79eb0d995ee7
```

✅ **Fixed**: Only the order number (Rendelésszám) is shown at the bottom now.

## Files Changed

### 1. `backend/src/controllers/webhooks.ts`

**Before:**
```typescript
const invoiceResponse = await szamlazzService.createInvoice({
  orderId: order.id,
  customer: customerData,
  items: invoiceItems,
  paymentMethod: config.szamlazz.invoice.paymentMethod,
  currency: config.szamlazz.invoice.currency,
  language: order.language || config.szamlazz.invoice.language,
  comment: `Foglalási azonosító: ${order.id}`,  // ❌ This was adding the line
});
```

**After:**
```typescript
const invoiceResponse = await szamlazzService.createInvoice({
  orderId: order.id,
  customer: customerData,
  items: invoiceItems,
  paymentMethod: config.szamlazz.invoice.paymentMethod,
  currency: config.szamlazz.invoice.currency,
  language: order.language || config.szamlazz.invoice.language,
  comment: undefined, // ✅ Booking IDs are now shown in each line item
});
```

### 2. `backend/src/services/szamlazz.ts`

Made the `<megjegyzes>` (comment) tag conditional - it's only included in the XML if there's actually a comment to show.

**Before:**
```typescript
<megjegyzes>${this.escapeXml(comment || '')}</megjegyzes>
```

**After:**
```typescript
${comment ? `<megjegyzes>${this.escapeXml(comment)}</megjegyzes>` : ''}
```

This keeps the XML cleaner when there's no comment.

## Why This Change?

1. **Redundancy**: Each booking line now shows its individual booking ID (e.g., `BK-1762871564108-6kxfzdssi`)
2. **Cleaner Invoice**: The order ID at the bottom was confusing since it's different from the individual booking IDs
3. **Order Number Remains**: The `Rendelésszám` field still shows the order ID for reference

## Testing

After restarting the backend, new invoices will:
- ✅ Show individual booking IDs in each line item description
- ✅ Show only "Rendelésszám" at the bottom (order number)
- ✅ NOT show "Foglalási azonosító" as a separate line

## Invoice Structure

**Line items** (each with their booking ID):
```
Frigyes foglalás - 2025. nov. 12. 15:00-16:00 (BK-xxx)
Karinthy foglalás - 2025. nov. 12. 15:00-16:00 (BK-yyy)
```

**Bottom fields**:
- `Rendelésszám`: Order UUID (shown in Szamlazz.hu field)
- No "Foglalási azonosító" line anymore

## Restart Required

Remember to restart the backend to apply these changes:

```powershell
cd backend
npm run dev
```

Then make a test booking to verify the new invoice format! 🎉

