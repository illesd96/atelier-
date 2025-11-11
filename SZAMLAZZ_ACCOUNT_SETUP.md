# Szamlazz.hu Account Setup Guide

## Critical: Company Information Must Be Configured First

The "unknown error" typically means your **company information is not fully configured** in your Szamlazz.hu account.

## ⚠️ Required Setup in Szamlazz.hu Dashboard

Before invoices can be generated, you MUST configure your company information in Szamlazz.hu:

### 1. **Log in to Szamlazz.hu**
- Go to: [https://www.szamlazz.hu/](https://www.szamlazz.hu/)
- Log in with your credentials

### 2. **Configure Company Profile**

Navigate to: **Beállítások** (Settings) → **Cégadatok** (Company Data)

**Required Information:**
- ✅ **Cégnév** (Company Name): Atelier Archilles (or your registered company name)
- ✅ **Adószám** (Tax Number): Your Hungarian tax number
- ✅ **Cím** (Address): **Karinthy Frigyes út 19**
- ✅ **Település** (City): **Budapest**
- ✅ **Irányítószám** (Postal Code): **1111**
- ✅ **Ország** (Country): **Magyarország**
- ✅ **Email**: studio@archilles.hu (or your business email)
- ✅ **Telefon**: Your business phone number

### 3. **Enable Számla Agent (API Access)**

Navigate to: **Beállítások** → **Számla Agent**

- ✅ Enable Számla Agent
- ✅ Generate API Key (Agent Kulcs)
- ✅ Copy the API key for your `.env` file

### 4. **Bank Account Configuration** (Optional but recommended)

Navigate to: **Beállítások** → **Bankszámla**

- ✅ Add your bank name
- ✅ Add your bank account number (format: 12345678-12345678-12345678)

### 5. **Invoice Number Prefix** (Optional)

If you want custom invoice numbers like "ATELIER-2025-001":

Navigate to: **Beállítások** → **Számlaszám előtagok**

- ✅ Add prefix: `ATELIER` or leave empty for default numbering

## 🔧 Environment Variables

After configuring Szamlazz.hu, update your `backend/.env`:

```bash
# Szamlazz.hu Configuration
SZAMLAZZ_ENABLED=true
SZAMLAZZ_USERNAME=your_email@archilles.hu
SZAMLAZZ_PASSWORD=your_szamlazz_password
SZAMLAZZ_AGENT_KEY=your_agent_key_from_dashboard

# Optional: Invoice Prefix (leave empty to use default)
SZAMLAZZ_INVOICE_PREFIX=

# Optional: Bank Information (if not configured in Szamlazz.hu dashboard)
SZAMLAZZ_SELLER_BANK=
SZAMLAZZ_SELLER_BANK_ACCOUNT=
```

## 🧪 Testing After Configuration

1. **Restart Backend**:
   ```powershell
   cd backend
   npm run dev
   ```

2. **Make a Test Booking**

3. **Check Backend Console** for detailed logs:
   ```
   📄 Raw XML response: ...
   🔍 Parsed XML: ...
   ```

4. **Expected Success**:
   ```
   📄 Generating invoice via Szamlazz.hu...
   ✅ Invoice generated: 2025-001
   ✅ Invoice saved to database
   📧 Confirmation email sent with invoice PDF
   ```

## 🔍 Troubleshooting "Unknown Error"

If you still get "unknown error" after configuration:

### Check the Backend Console Logs

Look for these new debug logs:
```
📄 Raw XML response: <?xml version="1.0" ...
🔍 Parsed XML: { ... }
```

These will show the actual error message from Szamlazz.hu.

### Common Issues:

1. **Company tax number not configured** → Error 7
2. **Company address incomplete** → Error 7
3. **Authentication failed** → Error 51
4. **Agent key invalid** → Error 52
5. **Company profile not verified** → Contact Szamlazz.hu support

## 📞 Szamlazz.hu Support

If issues persist:
- **Email**: info@szamlazz.hu
- **Phone**: +36 1 700 4030
- **Documentation**: [https://docs.szamlazz.hu/](https://docs.szamlazz.hu/)

---

## Summary Checklist

Before invoices will work:

- [ ] Szamlazz.hu account created and verified
- [ ] Company information fully configured (name, tax number, address)
- [ ] Address: **Karinthy Frigyes út 19, 1111 Budapest** entered in company profile
- [ ] Számla Agent (API) enabled
- [ ] Agent Key generated and added to `.env`
- [ ] Backend restarted with new configuration
- [ ] Test booking made to verify invoice generation

**Important**: The company address (Karinthy Frigyes út 19) should be configured in your **Szamlazz.hu account settings**, not in the API call. The API only sends customer information!

