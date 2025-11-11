# Billing Address & Email Template Fixes

## Problem Summary

1. **Szamlazz.hu Error**: Getting "Hiányzó adat: vevő címe (település)" (Missing data: customer address (city)) even when address was filled in the checkout form
2. **Email Template**: Order ID was displayed twice (once for each booking) instead of once at the end

## Root Cause

The database schema was storing the complete address as a single `invoice_address` text field, but the Szamlazz.hu integration code was trying to read separate fields (`billing_city`, `billing_zip`, `billing_address`, `billing_country`) that didn't exist.

## Solutions Implemented

### 1. Database Migration (007-billing-address-fields.sql)

Added four new columns to the `orders` table:
- `billing_street` - Street address
- `billing_city` - City name
- `billing_zip` - Postal/ZIP code  
- `billing_country` - Country (defaults to 'HU')

The migration also migrates existing data from `invoice_address` to `billing_street` for backward compatibility.

### 2. Checkout Controller Update

**File**: `backend/src/controllers/checkout.ts`

Updated the order creation logic to:
- Parse the full address string (format: "Street, PostalCode City, Country")
- Extract individual components (street, zip, city, country)
- Save them as separate database columns

**Example Address Parsing**:
```
Input: "Karinthy Frigyes út 19, 1111 Budapest, Hungary"
Output:
  - billing_street: "Karinthy Frigyes út 19"
  - billing_zip: "1111"
  - billing_city: "Budapest"
  - billing_country: "Hungary"
```

### 3. Email Template Improvement

**File**: `backend/src/templates/emails/confirmation.html`

**Before**:
```html
{{#each items}}
  <div class="booking-item">
    <div>Studio Name</div>
    <div>Date & Time</div>
    <div class="booking-code">
      Order ID: {{../orderId}}  <!-- Shown for each item! -->
    </div>
  </div>
{{/each}}
```

**After**:
```html
{{#each items}}
  <div class="booking-item">
    <div>Studio Name</div>
    <div>Date & Time</div>
  </div>
{{/each}}

<!-- Order ID shown once after all bookings -->
<div class="booking-code">
  Order ID: {{orderId}}
</div>
```

## Testing the Fix

1. **Make a test booking** with the following address:
   - Street: `Karinthy Frigyes út 19`
   - City: `Budapest`
   - Postal Code: `1111`
   - Country: `Hungary`

2. **Complete the payment**

3. **Check the email** - You should see:
   - ✅ All bookings listed first
   - ✅ Order ID shown once at the end
   
4. **Check Szamlazz.hu** - Invoice should generate successfully without "Missing city" error

## Database Migration Status

✅ Migration `007-billing-address-fields.sql` has been successfully applied

## Files Modified

1. ✅ `backend/src/database/migrations/007-billing-address-fields.sql` (new)
2. ✅ `backend/src/database/run-migration.js` (new helper script)
3. ✅ `backend/src/controllers/checkout.ts` (updated)
4. ✅ `backend/src/templates/emails/confirmation.html` (updated)

## Next Steps

1. **Restart the backend** to ensure all changes are loaded:
   ```powershell
   cd backend
   npm run dev
   ```

2. **Test a new booking** to verify:
   - Invoice generates without errors
   - Email shows Order ID only once
   - All address fields are properly saved

## Notes

- The old `invoice_address` field is preserved for backward compatibility
- Existing orders had their `invoice_address` migrated to `billing_street`
- New orders will have both fields populated

