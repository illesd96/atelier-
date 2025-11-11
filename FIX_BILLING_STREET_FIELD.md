# Fix: Wrong Database Column Name in Webhook

## Problem

Even though the database had the correct billing address data in the new columns, Szamlazz.hu was still getting the error:
```
Hiányzó adat: vevő címe (utca, házszám).
(Missing data: customer address (street, house number))
```

## Root Cause

The webhook controller was using the wrong column name:
- **Used**: `order.billing_address` (doesn't exist!)
- **Should use**: `order.billing_street`

Also, the tax number field was using `order.billing_tax_number` when it should use `order.invoice_tax_number`.

## Files Fixed

### 1. `backend/src/controllers/webhooks.ts`

**Before**:
```typescript
const customerData = {
  name: order.customer_name,
  email: order.email,
  phone: order.phone || undefined,
  taxNumber: order.billing_tax_number || undefined,  // ❌ Wrong field
  country: order.billing_country || 'HU',
  zip: order.billing_zip || '',
  city: order.billing_city || '',
  address: order.billing_address || '',  // ❌ Wrong field - doesn't exist!
};
```

**After**:
```typescript
const customerData = {
  name: order.customer_name,
  email: order.email,
  phone: order.phone || undefined,
  taxNumber: order.invoice_tax_number || undefined,  // ✅ Correct
  country: order.billing_country || 'HU',
  zip: order.billing_zip || '',
  city: order.billing_city || '',
  address: order.billing_street || '',  // ✅ Correct
};

console.log('📍 Customer data for Szamlazz.hu:', {
  name: customerData.name,
  city: customerData.city,
  zip: customerData.zip,
  address: customerData.address,
  country: customerData.country,
});
```

### 2. `backend/src/types/index.ts`

Added the new billing fields to the `Order` interface:

```typescript
export interface Order {
  // ... existing fields ...
  invoice_address?: string;
  billing_street?: string;     // ✅ Added
  billing_city?: string;        // ✅ Added
  billing_zip?: string;         // ✅ Added
  billing_country?: string;     // ✅ Added
  terms_accepted: boolean;
  // ... rest of fields ...
}
```

## Database Column Reference

| Database Column        | Used For                    |
|------------------------|----------------------------|
| `billing_street`       | Street address (utca, házszám) |
| `billing_city`         | City name (település)       |
| `billing_zip`          | Postal code (irányítószám)  |
| `billing_country`      | Country (ország)            |
| `invoice_tax_number`   | Tax number (adószám)        |
| `invoice_company`      | Company name (cégnév)       |

## Next Steps

1. **Restart the backend** to apply the changes:
   ```powershell
   cd backend
   # Stop the current backend process (Ctrl+C in the terminal running npm run dev)
   npm run dev
   ```

2. **Make a test booking** and watch the console logs

3. **Look for the new debug log**:
   ```
   📍 Customer data for Szamlazz.hu: {
     name: 'Test User',
     city: 'Budapest',
     zip: '1026',
     address: 'Endródi Sándor utca',
     country: 'Hungary'
   }
   ```

4. **Verify invoice generates successfully** ✅

## Testing Checklist

After restarting:
- [ ] Backend restarted with no errors
- [ ] Make a test booking with full address
- [ ] Check console for "📍 Customer data for Szamlazz.hu" log
- [ ] Verify all fields have values (no empty strings)
- [ ] Invoice generates successfully in Szamlazz.hu
- [ ] No "Hiányzó adat" errors

## Summary

The issue was a simple typo/wrong field name. The database migration added `billing_street`, but the code was trying to read `billing_address`. This has been corrected and now the webhook will properly read and send the street address to Szamlazz.hu.

