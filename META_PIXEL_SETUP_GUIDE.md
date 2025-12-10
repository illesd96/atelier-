# Meta Pixel Setup Guide

## Overview
Meta (Facebook) Pixel tracking has been integrated into your photo studio website to track advertisement performance and conversions.

## Current Status
⚠️ **Meta Pixel is currently DISABLED** (safely) until you add your actual Pixel ID.

The pixel code is in place but will not run until you provide a valid Meta Pixel ID. This prevents JavaScript errors while keeping the tracking infrastructure ready.

## Getting Your Meta Pixel ID

### Step 1: Access Meta Business Suite
1. Go to [business.facebook.com](https://business.facebook.com/)
2. Log in with your Facebook business account
3. Select your business

### Step 2: Find Your Pixel
1. Click on **"All Tools"** in the left menu
2. Select **"Events Manager"**
3. Click on **"Data Sources"** in the left sidebar
4. Find your Pixel (or create one if you don't have it)
5. Click on your Pixel name

### Step 3: Copy Your Pixel ID
1. Look for the Pixel ID at the top of the page
2. It's a 15-16 digit number (e.g., `1234567890123456`)
3. Copy this number

## Installing Your Pixel ID

### Edit index.html

1. Open `frontend/index.html`
2. Find line ~103 (look for the Meta Pixel Code section):

```javascript
<!-- Meta Pixel Code -->
<script>
  // Meta Pixel Configuration - ADD YOUR PIXEL ID HERE
  var metaPixelId = 'YOUR_PIXEL_ID';  // ← CHANGE THIS LINE
```

3. Replace `'YOUR_PIXEL_ID'` with your actual pixel ID:

```javascript
var metaPixelId = '1234567890123456';  // Your real pixel ID
```

### Enable NoScript Fallback (Optional)

Around line 122, uncomment the noscript fallback and add your pixel ID:

```html
<!-- Before: -->
<!-- Uncomment and add your pixel ID when ready:
<noscript>
  <img height="1" width="1" style="display:none" alt="Meta Pixel" src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1" />
</noscript>
-->

<!-- After: -->
<noscript>
  <img height="1" width="1" style="display:none" alt="Meta Pixel" src="https://www.facebook.com/tr?id=1234567890123456&ev=PageView&noscript=1" />
</noscript>
```

## Tracked Events

Once enabled, the following events are automatically tracked:

### Standard Events

| Event | When It Fires | Purpose |
|-------|--------------|---------|
| **PageView** | Every page load | Track overall site traffic |
| **ViewContent** | Room/studio page view | Track interest in specific studios |
| **AddToCart** | Adding booking to cart | Track booking interest |
| **InitiateCheckout** | Starting checkout | Track checkout funnel entry |
| **Purchase** | Successful payment | Track conversions (MOST IMPORTANT) |

### Custom Events

| Event | When It Fires | Purpose |
|-------|--------------|---------|
| **Schedule** | Appointment booking | Custom event for studio bookings |
| **Lead** | Contact form | Track lead generation |
| **CompleteRegistration** | User registration | Track new accounts |

## Verification

### 1. Check Meta Events Manager

After deployment with your Pixel ID:

1. Go to Meta Events Manager
2. Click on your Pixel
3. Click **"Test Events"** tab
4. Visit your website
5. You should see events appearing in real-time

### 2. Use Meta Pixel Helper Chrome Extension

1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Visit your website
3. Click the extension icon
4. You should see your pixel firing

### 3. Browser Console

Open browser console (F12) and check for:
- No Meta Pixel errors
- Log message: `[Meta Pixel] Skipped: Please add your Meta Pixel ID` (before adding ID)
- After adding ID, you should see Meta Pixel network requests

## Creating Custom Conversions

In Meta Events Manager, you can create custom conversions:

### Example: Studio Booking Conversion

1. Go to Events Manager → Custom Conversions
2. Click **"Create Custom Conversion"**
3. Name: "Studio Booking"
4. Data Source: Your Pixel
5. Event: `Purchase`
6. Add rule: `value greater than 0`
7. Save

### Example: Specific Studio Interest

1. Create Custom Conversion
2. Name: "Atelier Studio Interest"
3. Event: `ViewContent`
4. Add rule: `content_name contains "Atelier"`
5. Save

## Setting Up Ad Campaigns

### Conversion Tracking

When creating Facebook/Instagram ads:

1. In ad setup, choose **"Conversions"** objective
2. Select your Pixel as the conversion event source
3. Choose conversion event (e.g., "Purchase")
4. The pixel will automatically track conversions

### Retargeting Audiences

Create custom audiences based on pixel events:

1. Go to Audiences in Business Manager
2. Create **"Custom Audience"**
3. Source: Your website (pixel)
4. Events: 
   - People who viewed content but didn't purchase
   - People who added to cart but didn't complete
   - People who visited in last 30 days

## Troubleshooting

### Pixel Not Firing

**Problem:** No events showing in Events Manager

**Solutions:**
1. Verify you added your actual Pixel ID (not placeholder)
2. Check browser console for errors
3. Ensure you're not in localhost/development mode
4. Use Meta Pixel Helper to debug
5. Clear cache and hard refresh (Cmd/Ctrl + Shift + R)

### Events Firing Twice

**Problem:** Duplicate events in Meta

**Solutions:**
1. Check you only have pixel code in one place
2. Verify no other Meta pixel code elsewhere
3. Check browser extensions aren't duplicating events

### Purchase Event Not Tracking

**Problem:** Other events work but Purchase doesn't

**Solutions:**
1. Test the full checkout flow
2. Check that `PaymentResultPage.tsx` is loading correctly
3. Verify order has `price` data
4. Check network tab for Meta Pixel requests

### iOS Tracking Issues

**Problem:** Limited tracking on iOS 14+

**Note:** iOS 14+ users can opt out of tracking via App Tracking Transparency. This is expected and affects all advertisers.

**Solutions:**
1. Use aggregated event measurement
2. Set up conversion API (server-side tracking)
3. Focus on web conversions (desktop + Android)

## Data Privacy & GDPR Compliance

### Cookie Consent

The website already has cookie consent implemented. Meta Pixel respects user consent choices.

### Advanced Matching (Optional)

You can enable advanced matching to improve attribution:

In `index.html`, after initializing the pixel:

```javascript
fbq('init', metaPixelId, {
  em: 'hashed_email',  // SHA-256 hashed
  ph: 'hashed_phone',  // SHA-256 hashed
});
```

**Note:** Only use if you have explicit user consent for data sharing.

## Files Involved

| File | Purpose |
|------|---------|
| `frontend/index.html` | Pixel base code initialization |
| `frontend/src/utils/metaPixel.ts` | Event tracking utility |
| `frontend/src/contexts/CartContext.tsx` | AddToCart tracking |
| `frontend/src/components/CheckoutForm.tsx` | InitiateCheckout tracking |
| `frontend/src/pages/PaymentResultPage.tsx` | Purchase tracking |

## Support & Resources

- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Events Reference](https://developers.facebook.com/docs/meta-pixel/reference)
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/meta-pixel-helper/)

---

## Quick Setup Checklist

- [ ] Get Meta Pixel ID from Business Suite
- [ ] Add Pixel ID to `frontend/index.html` (line ~103)
- [ ] Uncomment noscript fallback (line ~122)
- [ ] Deploy changes
- [ ] Test with Meta Pixel Helper
- [ ] Verify events in Events Manager
- [ ] Create custom conversions
- [ ] Set up ad campaigns with conversion tracking

---

**Last Updated:** December 10, 2025  
**Status:** Ready for Pixel ID  
**Priority:** High (for ad tracking)

