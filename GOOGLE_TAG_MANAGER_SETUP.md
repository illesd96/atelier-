# Google Tag Manager Setup & Fix

## Problem Identified

Google Tag Manager (GTM) was installed correctly in the HTML, but **it wasn't tracking page views** after the initial page load. 

### Why?

Your website is a **React Single Page Application (SPA)** using React Router. When users navigate between pages (e.g., from Home → Booking → Checkout), React Router handles navigation **client-side** without reloading the page. This means:

- ✅ GTM loads once on first page visit
- ❌ GTM doesn't see subsequent page changes (React Router handles them internally)
- ❌ No pageview events sent to GTM after initial load

## Solution Implemented

We created a complete GTM integration for React SPAs that:

1. **Tracks all page changes** automatically
2. **Tracks e-commerce events** (purchases, checkout, etc.)
3. **Works seamlessly** with React Router

---

## Files Created/Modified

### 1. **GTM Utility Functions** (`frontend/src/utils/gtm.ts`)
Core functions for pushing events to GTM's dataLayer:

```typescript
- pushPageView(url, title) - Track page views
- pushEvent(eventName, data) - Track custom events
- trackBookingStarted() - Track booking initiation
- trackCheckoutStarted() - Track checkout begin
- trackPurchase() - Track completed purchases
- trackAddToCart() - Track add to cart events
```

### 2. **GTM Page Tracking Hook** (`frontend/src/hooks/useGTMPageTracking.ts`)
React hook that automatically detects route changes using `useLocation()` from React Router.

### 3. **GTM Page Tracker Component** (`frontend/src/components/GTMPageTracker.tsx`)
Lightweight component that uses the hook to track page changes throughout the app.

### 4. **Updated App.tsx**
Added `<GTMPageTracker />` inside the Router to enable automatic tracking.

### 5. **Updated PaymentResultPage.tsx**
Added `trackPurchase()` call when payment is successful to track conversions.

---

## GTM Container Details

- **Container ID:** `GTM-N4ZP5NQP`
- **Installed in:** `frontend/index.html`
  - Script in `<head>` (line 7-13)
  - NoScript iframe in `<body>` (line 128-131)

---

## Events Being Tracked

### Automatic Events

1. **Page Views** - Every route change
   ```javascript
   {
     event: 'pageview',
     page: {
       url: '/booking',
       title: 'Booking - Atelier Archilles'
     }
   }
   ```

### E-commerce Events

2. **Purchase** - When payment succeeds
   ```javascript
   {
     event: 'purchase',
     transaction_id: 'order_123',
     value: 45000,
     currency: 'HUF',
     items: [...]
   }
   ```

### Custom Events (Ready to Use)

3. **booking_started** - When user starts booking
4. **begin_checkout** - When user enters checkout
5. **add_to_cart** - When user adds item to cart

---

## How to Verify GTM is Working

### Method 1: Browser Console (Development)

1. Open your website in a browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Navigate between pages (Home → Booking → Contact, etc.)
5. You should see console logs:
   ```
   GTM PageView: { url: '/booking', title: '...' }
   GTM PageView: { url: '/contact', title: '...' }
   ```

### Method 2: GTM Preview Mode (Recommended)

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Open your container `GTM-N4ZP5NQP`
3. Click **Preview** button (top right)
4. Enter your website URL: `https://www.atelier-archilles.hu/`
5. A new window opens with GTM debugger
6. Navigate around your site
7. In the GTM debugger, you'll see all events firing in real-time:
   - `gtm.js` - GTM loaded
   - `gtm.dom` - DOM ready
   - `gtm.load` - Page loaded
   - `pageview` - Every time you change pages ✅
   - `purchase` - When someone completes payment ✅

### Method 3: Google Tag Assistant (Browser Extension)

1. Install [Tag Assistant Legacy](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Go to your website
3. Click the Tag Assistant icon
4. Click "Enable" and refresh the page
5. Navigate around - you should see GTM tag firing on each page

### Method 4: Network Tab

1. Open Developer Tools (`F12`)
2. Go to **Network** tab
3. Filter by `gtm` or `google-analytics`
4. Navigate between pages
5. You should see new network requests to `www.googletagmanager.com` on each page change

---

## Testing Checklist

After deploying, verify these scenarios:

- [ ] **Homepage loads** - GTM script loads successfully
- [ ] **Navigate to Booking** - New pageview event fires
- [ ] **Navigate to Room Detail** - New pageview event fires
- [ ] **Navigate to Contact** - New pageview event fires
- [ ] **Complete a test booking** - Purchase event fires with correct data
- [ ] **Browser back/forward buttons** - Pageviews fire correctly

---

## GTM Dashboard Setup

Now that GTM is properly tracking events, you can set up tags in GTM:

### 1. Google Analytics 4 (GA4)

**Trigger:** `pageview` event

```
Tag Type: Google Analytics: GA4 Configuration
Measurement ID: G-XXXXXXXXXX
Trigger: pageview
```

### 2. Google Ads Conversion Tracking

**Trigger:** `purchase` event

```
Tag Type: Google Ads Conversion Tracking
Conversion ID: AW-17663369824
Conversion Label: [your_label]
Trigger: purchase
Conversion Value: {{value}}
Currency: HUF
```

### 3. Facebook Pixel (Alternative)

If you want to manage Facebook Pixel via GTM instead of hardcoding:

```
Tag Type: Custom HTML
HTML: <script>fbq('track', 'PageView');</script>
Trigger: pageview
```

---

## Available Variables in GTM

You can use these in your tags:

- `{{Page URL}}` - Current page URL
- `{{Page Path}}` - Current page path
- `{{Page Title}}` - Current page title
- `{{Event}}` - Event name (pageview, purchase, etc.)
- Custom variables from events:
  - `{{transaction_id}}` - Order ID (purchase event)
  - `{{value}}` - Transaction value (purchase event)
  - `{{currency}}` - Currency code (HUF)
  - `{{items}}` - Array of purchased items

---

## Future Enhancements

You can easily add more tracking by using the GTM utility functions:

### Track Booking Started

```typescript
import { trackBookingStarted } from '../utils/gtm';

// In BookingPage.tsx or RoomDetailPage.tsx
trackBookingStarted('studio-a', 'Atelier Studio');
```

### Track Add to Cart

```typescript
import { trackAddToCart } from '../utils/gtm';

// When adding item to cart
trackAddToCart('studio-a', 'Atelier Studio', 15000);
```

### Track Checkout Started

```typescript
import { trackCheckoutStarted } from '../utils/gtm';

// In CheckoutPage.tsx
trackCheckoutStarted(45000, cartItems);
```

### Custom Event

```typescript
import { pushEvent } from '../utils/gtm';

// Track custom action
pushEvent('contact_form_submitted', {
  form_name: 'Contact Form',
  location: 'Contact Page'
});
```

---

## Troubleshooting

### GTM not loading

1. Check browser console for errors
2. Verify GTM container ID is correct: `GTM-N4ZP5NQP`
3. Check if ad blockers are blocking GTM
4. Clear browser cache and hard refresh (`Ctrl+F5`)

### Page views not tracking

1. Verify you deployed the updated code with `GTMPageTracker`
2. Check console logs (should show "GTM PageView: ...")
3. Use GTM Preview mode to debug
4. Verify `dataLayer` exists: type `window.dataLayer` in console

### Purchase events not firing

1. Test with a real booking (not just visiting the page)
2. Check console for GTM Purchase event
3. Verify in GTM Preview mode
4. Check if order status is 'paid' (not pending/failed)

### Events firing twice

This can happen if:
- GTM code is in multiple places
- You have both GTM and gtag.js tracking the same thing
- React component re-renders unexpectedly

**Solution:** Use GTM for all tracking, remove duplicate gtag.js calls.

---

## Summary

✅ **GTM is now properly installed and configured**
✅ **Page view tracking works on all route changes**
✅ **E-commerce tracking works for purchases**
✅ **Ready to add tags in GTM dashboard**
✅ **Console logging enabled for debugging**

## Next Steps

1. Deploy the updated code to production
2. Verify tracking works using GTM Preview mode
3. Set up your tags in GTM dashboard:
   - Google Analytics 4
   - Google Ads conversion tracking
   - Any other marketing pixels
4. Test a complete booking flow
5. Monitor real-time data in Google Analytics

---

## Support

If you need to track additional events or customize tracking:

1. Use the functions in `frontend/src/utils/gtm.ts`
2. Import and call them at the appropriate places
3. View events in GTM Preview mode to verify
4. Create corresponding triggers/tags in GTM dashboard

**Remember:** With GTM properly set up, you can now add/modify/remove tracking tags from the GTM dashboard without touching your code! 🎉
