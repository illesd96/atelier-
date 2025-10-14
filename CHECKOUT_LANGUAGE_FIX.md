# Checkout Language Fix

## Problem

The checkout was failing with a 400 Bad Request error because of a language code mismatch:

**Backend expected:** `'hu'` or `'en'`  
**Frontend was sending:** `'hu-HU'` or `'en-US'`

## Root Cause

The `i18next` library uses full locale codes like:
- `hu-HU` (Hungarian - Hungary)
- `en-US` (English - United States)

But the backend checkout validation schema only accepts:
- `hu` (Hungarian)
- `en` (English)

## Solution

Updated `frontend/src/components/CheckoutForm.tsx` to extract just the language code:

```typescript
// OLD CODE (BROKEN)
language: i18n.language as 'hu' | 'en',

// NEW CODE (FIXED)
// Extract language code (handles 'hu-HU' -> 'hu', 'en-US' -> 'en')
const languageCode = i18n.language.split('-')[0] as 'hu' | 'en';

const checkoutRequest: CheckoutRequest = {
  // ...
  language: languageCode,
  // ...
};
```

## How It Works

The `split('-')[0]` method:
- Takes the full locale code: `'hu-HU'`
- Splits it by the hyphen: `['hu', 'HU']`
- Takes the first element: `'hu'`

Examples:
- `'hu-HU'` → `'hu'`
- `'en-US'` → `'en'`
- `'hu'` → `'hu'` (still works if already short form)

## Testing

Test the checkout with both languages:

1. **Hungarian:**
   - Switch to Hungarian in the language selector
   - Add items to cart
   - Go to checkout
   - Fill form and submit
   - Should redirect to Barion payment page

2. **English:**
   - Switch to English in the language selector
   - Add items to cart
   - Go to checkout
   - Fill form and submit
   - Should redirect to Barion payment page

## Expected Request

The checkout request should now look like this:

```json
{
  "items": [
    {
      "room_id": "studio-b",
      "room_name": "Studio B",
      "date": "2025-10-14",
      "start_time": "18:00",
      "end_time": "19:00",
      "price": 15000
    }
  ],
  "customer": {
    "name": "Dániel Illés",
    "email": "dani.illes96@gmail.com",
    "phone": "06309747359"
  },
  "invoice": {
    "required": false
  },
  "language": "hu",  ← ✅ Now correct (was "hu-HU")
  "terms_accepted": true,
  "privacy_accepted": true
}
```

## Backend Validation

The backend validates the language field with this schema:

```typescript
// backend/src/controllers/checkout.ts
language: z.enum(['hu', 'en']),
```

This now matches what the frontend sends.

## Deployment

After deploying this fix:

1. **Frontend:** Redeploy to Vercel
2. **Test:** Try checkout in both languages
3. **Verify:** Check that payment redirect works

## Related Files

- `frontend/src/components/CheckoutForm.tsx` - Fixed language extraction
- `backend/src/controllers/checkout.ts` - Validation schema
- `backend/src/types/index.ts` - TypeScript types

## Future Improvements

If you need to support more languages in the future:

1. **Update backend validation:**
   ```typescript
   language: z.enum(['hu', 'en', 'de', 'fr']),
   ```

2. **Frontend automatically handles it:**
   - No changes needed, the `split('-')[0]` approach works for any locale

3. **Add translations:**
   - Add translation files in `frontend/src/i18n/locales/`
   - Example: `de.json`, `fr.json`

## Error Reference

**Before the fix:**

```
Status Code: 400 Bad Request
{
  "error": "Invalid request",
  "details": [
    {
      "code": "invalid_enum_value",
      "expected": ["hu", "en"],
      "received": "hu-HU",
      "path": ["language"]
    }
  ]
}
```

**After the fix:**

```
Status Code: 200 OK
{
  "orderId": "uuid-here",
  "paymentId": "barion-payment-id",
  "redirectUrl": "https://secure.barion.com/...",
  "total": 30000,
  "currency": "HUF"
}
```

## Testing Checklist

- [ ] Checkout works in Hungarian language
- [ ] Checkout works in English language
- [ ] Language is correctly sent to backend
- [ ] Barion payment page shows in correct language
- [ ] Confirmation email arrives in correct language

