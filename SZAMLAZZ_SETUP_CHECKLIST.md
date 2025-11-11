# Szamlazz.hu Setup Checklist

## ✅ Already Implemented

Your codebase already has full Szamlazz.hu integration! Here's what's ready:

- ✅ **Service Layer**: `backend/src/services/szamlazz.ts` - Complete invoice generation
- ✅ **Database Schema**: `backend/src/database/migrations/005-invoices.sql` - Invoice storage
- ✅ **Webhook Integration**: Automatic invoice creation after successful payment
- ✅ **PDF Storage**: Invoices stored in database and attached to confirmation emails
- ✅ **Error Handling**: Graceful fallback if invoice generation fails
- ✅ **Configuration**: All settings in `backend/src/config/index.ts`

## 🔧 What You Need to Set Up

### 1. **Szamlazz.hu Account Setup**

Go to [Szamlazz.hu](https://www.szamlazz.hu/) and:

1. Create an account or log in
2. Complete your company profile with:
   - Company name
   - Tax number (Adószám)
   - Address
   - Bank account details
3. Enable **Számla Agent** (API access) in Settings
   - Settings → Számla Agent → Enable
4. Generate an **Agent Key** (Számla Agent Kulcs) for extra security
   - Settings → Számla Agent → Generate Key
   - Copy this key - you'll need it for the .env file

### 2. **Add Environment Variables**

Add these to your `backend/.env` file:

```bash
# Szamlazz.hu Invoice System
SZAMLAZZ_ENABLED=true
SZAMLAZZ_USERNAME=your_email@archilles.hu
SZAMLAZZ_PASSWORD=your_szamlazz_password
SZAMLAZZ_AGENT_KEY=your_agent_key_here

# Invoice Settings
SZAMLAZZ_INVOICE_PREFIX=ATELIER

# Seller Information (will appear on invoices)
SZAMLAZZ_SELLER_BANK=OTP Bank
SZAMLAZZ_SELLER_BANK_ACCOUNT=12345678-12345678-12345678
SZAMLAZZ_SELLER_EMAIL_REPLY=studio@archilles.hu

# Email text for invoice emails (sent by Szamlazz.hu)
SZAMLAZZ_EMAIL_SUBJECT=Számla - Atelier Archilles Foglalás
SZAMLAZZ_EMAIL_TEXT=Köszönjük a foglalást az Atelier Archilles-ben! Csatoltan küldjük a számlát.
```

### 3. **Run Database Migration**

If you haven't already, run the invoice migration:

```bash
cd backend
psql $DATABASE_URL -f src/database/migrations/005-invoices.sql
```

This creates the `invoices` table and adds `invoice_id` column to `orders`.

### 4. **Install Dependencies**

Check if these packages are installed:

```bash
cd backend
npm install axios form-data xml2js
npm install --save-dev @types/xml2js
```

### 5. **Update env.example**

Add the Szamlazz variables to `backend/env.example`:

```bash
# Szamlazz.hu Invoice System
SZAMLAZZ_ENABLED=true
SZAMLAZZ_USERNAME=your_email@archilles.hu
SZAMLAZZ_PASSWORD=your_szamlazz_password
SZAMLAZZ_AGENT_KEY=your_agent_key_here
SZAMLAZZ_INVOICE_PREFIX=ATELIER
SZAMLAZZ_SELLER_BANK=OTP Bank
SZAMLAZZ_SELLER_BANK_ACCOUNT=12345678-12345678-12345678
SZAMLAZZ_SELLER_EMAIL_REPLY=studio@archilles.hu
SZAMLAZZ_EMAIL_SUBJECT=Számla - Atelier Archilles Foglalás
SZAMLAZZ_EMAIL_TEXT=Köszönjük a foglalást!
```

## ✅ Recent Fixes

### 1. Invoice Prefix XML Error - FIXED
**Issue**: Error 57 - `'PHOTO' is not a valid value for 'boolean'`
**Cause**: Invoice prefix was using wrong XML tag (`<elolegszamla>` instead of `<szamlaszamElotag>`)
**Status**: ✅ Fixed - Invoice prefix now uses correct tag

### 2. Bank Information XML Structure - FIXED
**Issue**: Error 57 - `Invalid content was found starting with element 'bank'`
**Cause**: Bank details (`<bank>` and `<bankszamlaszam>`) were in `<fejlec>` section but belong in `<elado>` section
**Status**: ✅ Fixed - Bank information moved to correct section

### 3. Customer Address Fields Order - FIXED
**Issue**: Error 57 - `Invalid content found starting with element 'email'. One of 'irsz' is expected`
**Cause**: Address fields (`<irsz>`, `<telepules>`, `<cim>`) were conditionally omitted, breaking XML schema order
**Status**: ✅ Fixed - All address fields now always present (with empty values if not provided)

### 4. Customer Fields Sequence - FIXED
**Issue**: Error 57 - `Invalid content found starting with element 'sendEmail'. One of 'megjegyzes' is expected`
**Cause**: `<sendEmail>` was placed after optional fields (`<telefonszam>`, `<adoszam>`), should come before them
**Status**: ✅ Fixed - Correct order: email → sendEmail → adoszam → telefonszam

### 5. Invoice Prefix Configuration - RESOLVED
**Issue**: Error 202 - `"Ez a számlaszám előtag nem létezik vagy nincs engedélyezve: PHOTO"`
**Cause**: Invoice prefix must be configured in Szamlazz.hu dashboard first
**Solution**: Either configure prefix in Szamlazz.hu or remove `SZAMLAZZ_INVOICE_PREFIX` from `.env`
**Status**: ✅ Configuration issue (not code)

### 6. Missing Customer Address Data - FIXED
**Issue**: Error 7 - `"Hiányzó adat: vevő címe (település)"` (Missing city)
**Cause**: Customers without invoice request don't provide address, but Szamlazz.hu requires city
**Status**: ✅ Fixed - Webhook now provides default values (Budapest, 1111) when address not provided

### 7. Unknown Error - ACCOUNT CONFIGURATION REQUIRED
**Issue**: Error "unknown" - Generic unknown error
**Cause**: **Company information not fully configured in Szamlazz.hu dashboard**
**Required**: 
- Company name, tax number, and address MUST be configured in Szamlazz.hu account
- Address: **Karinthy Frigyes út 19, 1111 Budapest** must be in company profile
- Számla Agent (API) must be enabled
**Solution**: See `SZAMLAZZ_ACCOUNT_SETUP.md` for detailed setup guide
**Status**: ⚠️ Requires Szamlazz.hu dashboard configuration

## 🧪 Testing

### Test in Szamlazz.hu Test Mode

1. **Use Test Account**: Szamlazz.hu doesn't have a separate test mode
2. **Make a Test Booking**: Go through the booking flow
3. **Check Console Logs**: Look for these messages:
   ```
   📄 Generating invoice for order: [order-id]
   ✅ Invoice generated: ATELIER-2025-001
   ✅ Invoice saved to database: [invoice-id]
   📧 Confirmation email sent to [email] (with invoice)
   ```

4. **Verify in Szamlazz.hu**: Log in and check that invoice appears
5. **Check Email**: Customer should receive:
   - Your confirmation email (with PDF attached)
   - Szamlazz.hu's invoice email

### What Gets Created

When a customer completes payment:

1. **Bookings** are created in your database
2. **Invoice** is generated via Szamlazz.hu API
3. **Invoice PDF** is stored in your database
4. **Confirmation email** is sent with:
   - Booking details
   - Calendar file (.ics)
   - Invoice PDF attached
5. **Szamlazz.hu** also sends invoice directly to customer

## 📊 Invoice Details

### Current VAT Rate: 27%

The system uses Hungarian standard VAT rate (27%). Located in:
- `backend/src/controllers/webhooks.ts` line 118

To change VAT rate, modify this calculation:
```typescript
const netPrice = order.total_amount / 1.27; // Change 1.27 for different VAT
const vatRate = 27; // Change to your VAT percentage
```

### Invoice Items

Each booking appears as a line item:
```
Atelier foglalás - 2025-11-15 10:00-11:00
Quantity: 1 óra
Price: 15,000 HUF (net)
VAT: 4,050 HUF (27%)
Total: 19,050 HUF
```

## 🔍 Troubleshooting

### Common Issues

1. **No invoice generated**
   - Check `SZAMLAZZ_ENABLED=true`
   - Verify username/password
   - Check console logs for errors

2. **Authentication error (51)**
   - Wrong username or password
   - Verify credentials in Szamlazz.hu

3. **Agent key error (52)**
   - Invalid agent key
   - Remove agent key or regenerate in Szamlazz.hu

4. **Missing customer email (271)**
   - Customer email is required
   - Check order data has email field

### Debug Mode

To see detailed API communication:
```typescript
// In backend/src/services/szamlazz.ts, add before line 199:
console.log('📤 Sending XML to Szamlazz.hu:', xmlData);
```

## 📚 Resources

- **Szamlazz.hu API Docs**: https://docs.szamlazz.hu/
- **Error Codes**: https://docs.szamlazz.hu/hu/agent#error-codes
- **XML Schema**: https://www.szamlazz.hu/szamla/docs/xsds/agent/xmlszamla.xsd
- **Support**: info@szamlazz.hu | +36 1 700 4030

## 🚀 Production Deployment

Before going live:

1. ✅ Test with real bookings
2. ✅ Verify invoice numbers sequence
3. ✅ Check all company details on invoice
4. ✅ Test cancellation flow
5. ✅ Ensure backup of invoices table
6. ✅ Set up monitoring for invoice generation failures
7. ✅ Add Vercel/production environment variables

## 🔐 Security

- ⚠️ **Never commit** .env file to git
- ✅ Use Agent Key for extra security
- ✅ Rotate credentials regularly
- ✅ Store credentials in Vercel environment variables
- ✅ Limit database access to invoice data

---

**Status**: Ready to configure
**Last Updated**: November 11, 2024
**Integration Version**: 1.0.0

