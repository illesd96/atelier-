# Barion Payment Debugging Guide

## Current Issue Analysis

### Error Message:
```json
{
    "error": "Internal server error",
    "message": "Failed to create payment in Barion"
}
```

### Your Current Configuration:
```
BARION_POS_KEY=7b5c30a2-e02f-4fcd-b5ff-a5da7ba27bb5
BARION_ENVIRONMENT=test
BARION_PAYEE_EMAIL=dani.illes96@gmail.com
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

## Common Causes & Solutions

### 1. **Barion Test Environment Issues**

**BPT (Barion Pixel Tracking) ID**: `BPT-fHvthFc8pR-A3`
- ✅ This is a **test** pixel ID (starts with `BPT-`)
- ⚠️ For **production**, you'll need a different pixel ID

### 2. **Check Backend Logs**

The code logs detailed error information. Check your backend console for:

```
❌ Error creating Barion payment: [error message]
🔴 Barion Error Response: [detailed error]
```

### 3. **Common Barion API Errors**

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `InvalidPOSKey` | Invalid POS Key | Verify your POS Key in Barion dashboard |
| `InvalidPayeeEmail` | Wrong email | Use email registered in Barion account |
| `InvalidAmount` | Amount issue | Check totalAmount > 0 |
| `InvalidCallbackUrl` | Callback unreachable | Ensure backend URL is accessible |
| `ShopIsClosed` | Shop not active | Activate shop in Barion dashboard |

### 4. **Required Checks**

#### ✅ Check #1: Barion Shop is Active
1. Log in to [https://secure.test.barion.com/](https://secure.test.barion.com/)
2. Go to "My shops"
3. Ensure your shop is **ACTIVE**
4. Check that `dani.illes96@gmail.com` is registered as shop owner

#### ✅ Check #2: POS Key is Correct
1. In Barion dashboard → My shops → [Your Shop]
2. Copy the **POS Key** (Public Key)
3. Ensure it matches your `.env` file

#### ✅ Check #3: Payee Email
- Must be: `dani.illes96@gmail.com` (your registered email)
- Currently set: ✅ Correct

#### ✅ Check #4: Test Credit Cards
For Barion TEST environment, use these test cards:

**Successful Payment:**
```
Card Number: 9900 0000 0000 0131
Expiry: Any future date
CVV: 123
Name: TEST CARD
```

**Failed Payment (for testing):**
```
Card Number: 9900 0000 0000 0140
```

### 5. **Debugging Steps**

#### Step 1: Check Backend is Running
```powershell
# From backend directory
npm run dev
```

Should see:
```
Server running on port 3001
```

#### Step 2: Check Barion API Response
Look in backend console for:
```
🔵 Barion Payment Request: { ... }
❌ Error creating Barion payment: ...
🔴 Barion Error Response: { ... }
```

#### Step 3: Test Barion API Directly

Create a test file `test-barion.ts`:

```typescript
import axios from 'axios';

const testBarionAPI = async () => {
  try {
    const response = await axios.post(
      'https://api.test.barion.com/v2/Payment/Start',
      {
        POSKey: '7b5c30a2-e02f-4fcd-b5ff-a5da7ba27bb5',
        PaymentType: 'Immediate',
        GuestCheckOut: true,
        FundingSources: ['All'],
        PaymentRequestId: 'test-' + Date.now(),
        Locale: 'hu-HU',
        Currency: 'HUF',
        Transactions: [{
          POSTransactionId: 'trans-test-' + Date.now(),
          Payee: 'dani.illes96@gmail.com',
          Total: 15000,
          Items: [{
            Name: 'Test Booking',
            Description: 'Test',
            Quantity: 1,
            Unit: 'hour',
            UnitPrice: 15000,
            ItemTotal: 15000,
            SKU: 'test-1'
          }]
        }],
        RedirectUrl: 'http://localhost:3000/payment/result?orderId=test',
        CallbackUrl: 'http://localhost:3001/api/webhooks/barion'
      }
    );
    
    console.log('✅ Success:', response.data);
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testBarionAPI();
```

Run it:
```powershell
cd backend
npx ts-node test-barion.ts
```

### 6. **Missing Configuration?**

Check if `BARION_PIXEL_ID` is needed in backend (it shouldn't be, but let's verify):

```bash
# Backend .env - Should NOT have PIXEL_ID (it's frontend only)
BARION_ENVIRONMENT=test
BARION_POS_KEY=your_pos_key
BARION_PAYEE_EMAIL=your_email

# Frontend .env.local - SHOULD have PIXEL_ID
VITE_BARION_PIXEL_ID=BPT-fHvthFc8pR-A3
```

### 7. **Network/Firewall Issues**

If running locally:
- ✅ Backend must be accessible on `localhost:3001`
- ✅ Frontend must be accessible on `localhost:3000`
- ⚠️ Barion needs to reach your `CallbackUrl` (won't work on localhost for webhooks)

For webhook testing, you might need:
- Use **ngrok** or similar to expose localhost
- Or temporarily comment out callback URL validation

### 8. **Production vs Test**

Your current setup:
- ✅ Using `test` environment
- ✅ Test POS Key
- ✅ Test Pixel ID (`BPT-...`)

For production:
- Change `BARION_ENVIRONMENT=prod`
- Use production POS Key
- Get production Pixel ID (won't start with `BPT-`)
- Use `https://api.barion.com` (auto-configured)

## Quick Fix Checklist

1. [ ] Backend server is running (`npm run dev` in backend folder)
2. [ ] Barion shop is ACTIVE in test dashboard
3. [ ] POS Key matches Barion dashboard
4. [ ] Payee email is correct (`dani.illes96@gmail.com`)
5. [ ] Check backend console for detailed error
6. [ ] Try test payment with test card (9900 0000 0000 0131)
7. [ ] Verify frontend `.env.local` has `VITE_BARION_PIXEL_ID`

## Next Steps

1. **Check Backend Logs**: Look for the detailed Barion error response
2. **Verify Barion Dashboard**: Ensure shop is active
3. **Test Direct API Call**: Use the test script above
4. **Share Error Details**: Copy the full error from backend console

---

**Need Help?**
- Barion Test Support: [https://docs.barion.com/](https://docs.barion.com/)
- Barion Test Dashboard: [https://secure.test.barion.com/](https://secure.test.barion.com/)

