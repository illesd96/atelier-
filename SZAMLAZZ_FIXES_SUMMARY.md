# Szamlazz.hu Fixes - Summary

## ✅ Completed Changes

### 1. **Invoices are now VAT-free (Tárgyi adó mentes)**
- **File**: `backend/src/services/szamlazz.ts`
- **Changes**:
  - Set `<afakulcs>` to `TAM` (Tárgyi adó mentes)
  - Set VAT amount (`<afaErtek>`) to `0`
  - Set gross amount (`<bruttoErtek>`) equal to net price
- **Result**: All invoices will now be generated as tax-exempt

### 2. **Invoices are marked as paid (fizetve)**
- **File**: `backend/src/services/szamlazz.ts`
- **Changes**:
  - Added `<fizetve>true</fizetve>` to the invoice header
- **Result**: Invoices will show as already paid in Szamlazz.hu

### 3. **Fixed date/time formatting in invoice description**
- **File**: `backend/src/controllers/webhooks.ts`
- **Changes**:
  - Changed from: `"Tue Nov 11 2025 00:00:00 GMT+0000 (Coordinated Universal Time) 18:00:00-19:00:00"`
  - Changed to: `"2025. nov. 11. 18:00-19:00"`
  - Used Hungarian locale formatting for dates
- **Result**: Clean, readable date format without GMT/timezone information

### 4. **Added booking number to invoice description**
- **File**: `backend/src/controllers/webhooks.ts`
- **Changes**:
  - Invoice description now includes booking ID
  - Format: `"Frigyes foglalás - 2025. nov. 11. 18:00-19:00 (BK-1762858520591-y7j2c2555)"`
- **Result**: Easy to trace bookings on invoices

### 5. **Removed default address fallbacks**
- **File**: `backend/src/controllers/webhooks.ts`
- **Changes**:
  - Removed default values: `'1111'`, `'Budapest'`, `'N/A'`
  - Customer data now uses actual values from order or empty strings
- **Result**: No more fake data on invoices

### 6. **Updated checkout form to always require address**
- **File**: `frontend/src/components/CheckoutForm.tsx`
- **Changes**:
  - Address fields (street, city, postal code, country) are now **always required**
  - Separated "business invoice" option from address collection
  - New checkbox: "Céges számlát kérek" (I need a business invoice)
  - Company name and tax number only shown when business invoice is checked
- **Result**: 
  - All customers must provide address
  - Only business customers need to provide company name and tax number

### 7. **Invoice prefix change**
- **File**: `backend/.env` (requires manual update)
- **Required Change**: 
  ```bash
  # Change from:
  SZAMLAZZ_INVOICE_PREFIX=PHOTO
  
  # Change to:
  SZAMLAZZ_INVOICE_PREFIX=AAS
  ```
- **Result**: Invoice numbers will be prefixed with "AAS" instead of "PHOTO" (e.g., `AAS-2025-001`)

## 🔧 Manual Steps Required

### 1. Update `.env` file
You need to manually update the invoice prefix:

```powershell
cd backend
# Edit .env file and change:
SZAMLAZZ_INVOICE_PREFIX=PHOTO
# to:
SZAMLAZZ_INVOICE_PREFIX=AAS
```

### 2. Restart backend server
After updating `.env`, restart your backend:

```powershell
cd backend
npm run dev
```

### 3. Verify Szamlazz.hu account settings
Make sure your Szamlazz.hu account has:
- ✅ Complete company information (name, tax number, address: **Karinthy Frigyes út 19, 1111 Budapest**)
- ✅ Invoice prefix "AAS" configured (if you want it)
- ✅ Számla Agent (API) enabled

## 📝 New Checkout Form Flow

**Before:**
1. Customer enters name, email, phone
2. Customer checks "I need an invoice"
3. If checked, show company, tax number, and address fields

**After:**
1. Customer enters name, email, phone
2. Customer enters address (ALWAYS - required for all)
3. Customer checks "I need a business invoice" (optional)
4. If checked, show company name and tax number fields

## 📄 Invoice Example

**Old invoice description:**
```
Frigyes foglalás - Tue Nov 11 2025 00:00:00 GMT+0000 (Coordinated Universal Time) 18:00:00-19:00:00
```

**New invoice description:**
```
Frigyes foglalás - 2025. nov. 11. 18:00-19:00 (BK-1762858520591-y7j2c2555)
```

## 🧪 Testing Checklist

After restarting the backend:

- [ ] Make a test booking
- [ ] Fill in address fields (required)
- [ ] Check "I need a business invoice"
- [ ] Fill in company name and tax number
- [ ] Complete payment
- [ ] Check invoice in Szamlazz.hu:
  - [ ] Invoice number starts with "AAS-"
  - [ ] Invoice is marked as paid (fizetve)
  - [ ] VAT shows as "TAM" (0%)
  - [ ] Date format is clean (no GMT string)
  - [ ] Booking number is included
  - [ ] Customer address is correct

## ❓ Question from User

> "is foglalási szám for every foglalás or is it for every studio in a folalás becuse if it is we should write it in megnevezés"

**Answer**: The booking number (`booking_id`) is **per studio booking** (per order_item), not per order. Each studio booking gets its own unique booking ID like `BK-1762858520591-y7j2c2555`. 

**Solution**: ✅ I've added the booking number to each line item description on the invoice, so if you book multiple studios in one order, each line will show its own booking ID.

Example multi-studio invoice:
```
Item 1: Frigyes foglalás - 2025. nov. 11. 18:00-19:00 (BK-1762858520591-abc123)
Item 2: Atelier foglalás - 2025. nov. 11. 19:00-20:00 (BK-1762858520591-def456)
```

## 📚 Related Documentation

- `SZAMLAZZ_SETUP.md` - Complete setup guide
- `SZAMLAZZ_ACCOUNT_SETUP.md` - Account configuration guide
- `SZAMLAZZ_SETUP_CHECKLIST.md` - Setup checklist

---

**All changes are complete and ready to test!** 🎉

Just update the `.env` file with the new prefix and restart the backend.

