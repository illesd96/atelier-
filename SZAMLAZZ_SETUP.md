# Szamlazz.hu Invoice Integration Setup

This document describes how to set up automatic invoice generation using [Szamlazz.hu](https://www.szamlazz.hu/) for your photo studio booking system.

## Overview

When a customer completes payment for a booking, the system will:
1. ✅ Create internal bookings
2. 📄 Generate an invoice via Szamlazz.hu API
3. 💾 Store the invoice in the database
4. 📧 Send confirmation email with invoice PDF attached
5. 📮 Szamlazz.hu also sends the invoice directly to the customer

## Prerequisites
32
1. **Szamlazz.hu Account**: You need an active Szamlazz.hu account
2. **API Access**: Enable API access in your Szamlazz.hu settings
3. **Agent Key** (optional but recommended): Generate an Agent Key for enhanced security

## Configuration Steps

### 1. Get Your Szamlazz.hu Credentials

Log in to your Szamlazz.hu account and gather the following information:
- Username (email)
- Password
- Agent Key (Számla Agent Kulcs) - optional but recommended

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Szamlazz.hu Invoice System
SZAMLAZZ_ENABLED=true
SZAMLAZZ_USERNAME=your_username@example.com
SZAMLAZZ_PASSWORD=your_password
SZAMLAZZ_AGENT_KEY=your_agent_key_here  # Optional

# Invoice Prefix (appears in invoice numbers)
SZAMLAZZ_INVOICE_PREFIX=PHOTO

# Seller Information (for invoices)
SZAMLAZZ_SELLER_BANK=OTP Bank
SZAMLAZZ_SELLER_BANK_ACCOUNT=12345678-12345678-12345678
SZAMLAZZ_SELLER_EMAIL_REPLY=info@yourstudio.com

# Email settings for Szamlazz.hu invoices
SZAMLAZZ_EMAIL_SUBJECT=Számla a foglalásáról
SZAMLAZZ_EMAIL_TEXT=Köszönjük a foglalást! Csatoltan küldjük a számlát.
```

### 3. Database Migration

Run the database migration to create the `invoices` table:

```bash
cd backend
# Run migration 005-invoices.sql
```

The migration will create:
- `invoices` table to store invoice data
- Indexes for efficient queries
- `invoice_id` column in the `orders` table

### 4. Install Required Dependencies

The integration requires the following Node.js packages:

```bash
npm install axios form-data xml2js
npm install --save-dev @types/xml2js
```

### 5. Test Configuration

To test if your Szamlazz.hu integration is working:

1. Set `SZAMLAZZ_ENABLED=true` in your `.env` file
2. Make a test booking and complete payment
3. Check the logs for invoice generation messages:
   ```
   📄 Generating invoice via Szamlazz.hu...
   ✅ Invoice generated: PHOTO-2025-001
   ✅ Invoice saved to database: [invoice-id]
   📧 Confirmation email sent to customer@example.com (with invoice)
   ```

## Invoice Generation Flow

```
Payment Success
    ↓
Create Bookings
    ↓
Generate Invoice via Szamlazz.hu API
    ↓
┌─────────────────────────────────┐
│ Szamlazz.hu creates invoice    │
│ and returns PDF                  │
└─────────────────────────────────┘
    ↓
Save Invoice to Database
    ↓
Send Confirmation Email
    ├─ Calendar File (.ics)
    └─ Invoice PDF (attached)
    ↓
Mark Invoice as "sent"
```

## Invoice Data Structure

### Database Schema

```sql
invoices (
  id                  UUID (primary key)
  order_id            UUID (foreign key)
  szamlazz_id        VARCHAR(255)      -- Szamlazz.hu internal ID
  invoice_number     VARCHAR(100)       -- e.g., PHOTO-2025-001
  invoice_type       VARCHAR(50)        -- normal, proforma, etc.
  gross_amount       DECIMAL(10,2)
  net_amount         DECIMAL(10,2)
  vat_amount         DECIMAL(10,2)
  currency           VARCHAR(3)         -- HUF
  customer_name      VARCHAR(255)
  customer_email     VARCHAR(255)
  customer_tax_number VARCHAR(50)
  pdf_data           BYTEA              -- PDF binary
  status             VARCHAR(50)        -- generated, sent, cancelled
  szamlazz_response  JSON              -- Full API response
  created_at         TIMESTAMP
  updated_at         TIMESTAMP
)
```

## VAT Calculation

The system currently uses a **27% VAT rate** (Hungarian standard rate for services).

The calculation in `webhooks.ts`:
```typescript
const netPrice = order.total_amount / 1.27;  // Remove VAT
const vatRate = 27;
const vatAmount = netPrice * 0.27;
const grossAmount = netPrice + vatAmount;
```

**To change VAT rate:**
Modify the calculation in `backend/src/controllers/webhooks.ts` around line 118.

## Features

### ✅ Implemented

- Automatic invoice generation after successful payment
- PDF storage in database
- Invoice attachment in confirmation emails
- Bilingual support (Hungarian/English)
- Error handling (booking continues even if invoice fails)
- Invoice status tracking (generated, sent, cancelled)
- Customer information from order data
- Detailed invoice items with booking information

### 🚧 Future Enhancements

- Invoice cancellation/reversal (sztornó)
- Proforma invoices
- Invoice download from customer portal
- Manual invoice generation from admin panel
- Batch invoice generation
- Invoice number customization
- Multiple VAT rates support

## Troubleshooting

### Invoice Not Generated

1. **Check if enabled**: Verify `SZAMLAZZ_ENABLED=true`
2. **Check credentials**: Ensure username and password are correct
3. **Check logs**: Look for error messages in the console
   ```bash
   ❌ Szamlazz.hu error: [error code]: [error message]
   ```
4. **Check Szamlazz.hu account**: Ensure API access is enabled

### Invoice Generated But Not Attached

1. Check if PDF was received from Szamlazz.hu
2. Check logs for "Confirmation email sent to X (with invoice)"
3. Verify `pdf_data` column in `invoices` table

### Common Error Codes

- **51**: Authentication failed (wrong username/password)
- **52**: Agent key invalid
- **53**: XML structure error
- **57**: Missing required field
- **271**: Customer email missing

Full error code list: https://docs.szamlazz.hu/hu/agent#error-codes

## API Documentation

Full Szamlazz.hu API documentation:
- Hungarian: https://docs.szamlazz.hu/hu/php
- Agent API: https://docs.szamlazz.hu/hu/agent
- XML Schema: https://www.szamlazz.hu/szamla/docs/xsds/agent/xmlszamla.xsd

## Security Notes

1. **Never commit** `.env` file with credentials to git
2. Use **Agent Key** for additional security layer
3. Store credentials securely (use environment variables)
4. Limit API access to production server IP if possible
5. Regularly rotate passwords and agent keys

## Support

For Szamlazz.hu API issues:
- Documentation: https://docs.szamlazz.hu/
- Support: info@szamlazz.hu
- Phone: +36 1 700 4030

For integration issues:
- Check this document first
- Review application logs
- Contact development team

---

**Last updated**: 2025-05-15
**Integration version**: 1.0.0

