# Production Launch Checklist

## ✅ Completed Fixes

### Company Information
- ✅ Real company name: Archilles Studio Kft.
- ✅ Tax number: 32265105143
- ✅ Company registry: 01 09 415029
- ✅ Real address: 1111 Budapest, Vak Bottyán utca 3. 6. emelet 1. ajtó
- ✅ Real phone: +36 30 974 7362
- ✅ Updated in structuredData.ts
- ✅ Updated in ContactPage.tsx
- ✅ Updated in translation files (en.json, hu.json)

### Code Quality
- ✅ Console.log removal configured (vite.config.ts)
- ✅ Production build will strip all console statements
- ✅ About page commented out (no placeholder visible)
- ✅ TODO comments removed/replaced with descriptive comments

### Created Files
- ✅ `frontend/vite.config.ts` - Strips console.log in production
- ✅ `frontend/src/components/shared/CompanyInfo.tsx` - Centralized company data

---

## 🔧 Final Steps Before Barion Submission

### 1. Environment Variables Check

**Backend `.env` (CRITICAL):**
```bash
# ⚠️ VERIFY THESE ARE PRODUCTION VALUES:
NODE_ENV=production
BARION_ENVIRONMENT=prod  # NOT 'test'!
BARION_POS_KEY=your_production_pos_key  # NOT test key!
BARION_PIXEL_ID=BP-xxxxx-xxxxx  # Your real Pixel ID
BARION_PAYEE_EMAIL=studio@archilles.hu  # Real email

# Szamlazz.hu (if enabled)
SZAMLAZZ_ENABLED=true
SZAMLAZZ_USERNAME=your_real_username
SZAMLAZZ_PASSWORD=your_real_password

# Email
SMTP_USER=your_real_email@gmail.com
FROM_EMAIL=studio@archilles.hu

# URLs
FRONTEND_URL=https://yourdomain.com  # Your real domain
BACKEND_URL=https://api.yourdomain.com  # Your real API domain
```

**Frontend `.env`:**
```bash
VITE_BARION_PIXEL_ID=BP-xxxxx-xxxxx  # Same as backend
VITE_API_URL=https://api.yourdomain.com
```

---

### 2. Build & Deploy

```bash
# Frontend
cd frontend
npm run build  # This will remove all console.log statements

# Backend
cd backend
npm run build
```

---

### 3. SSL Certificate

- [ ] Ensure HTTPS is enabled on your domain
- [ ] Verify SSL certificate is valid
- [ ] Test that webhook URL is accessible: `https://api.yourdomain.com/api/webhooks/barion`

---

### 4. DNS & Domain

- [ ] Domain pointed to your server
- [ ] DNS propagated (check with `nslookup yourdomain.com`)
- [ ] Both www and non-www versions work
- [ ] SSL certificate covers both versions

---

### 5. Test Production Flow (DO THIS!)

**Make a real test booking with your own card:**

1. Visit your production website
2. Book a studio slot
3. Complete payment with real credit card
4. Verify:
   - [ ] Payment processed in Barion dashboard
   - [ ] Booking confirmation email received
   - [ ] Invoice generated (if Szamlazz.hu enabled)
   - [ ] Invoice attached to email
   - [ ] Booking appears in admin panel
   - [ ] No console errors in browser console

---

### 6. Barion Pixel Verification

Open browser console (F12) on production site and verify:

1. **Booking page:**
   - Should see Pixel loaded
   - NO console.log messages should appear!

2. **Checkout page:**
   - Pixel tracking checkout
   - NO debug messages

3. **Payment result:**
   - Pixel tracking purchase
   - NO debug output

**If you see console.log messages, the build is not stripping them!**

---

### 7. Webhook Test

Test that Barion can reach your webhook:

```bash
# Test webhook endpoint is publicly accessible
curl -X POST https://api.yourdomain.com/api/webhooks/barion \
  -H "Content-Type: application/json" \
  -d '{"PaymentId": "test", "PaymentState": "Succeeded"}'

# Should return a response (not 404 or timeout)
```

---

### 8. All Links Working

Visit your production site and check:

- [ ] Home page loads
- [ ] Booking page works
- [ ] All studio pages load
- [ ] Checkout page works
- [ ] Terms page loads
- [ ] Privacy page loads
- [ ] FAQ page loads
- [ ] Contact page loads
- [ ] Blog page loads
- [ ] Login/Register work
- [ ] Admin pages (for admin users)
- [ ] NO 404 errors
- [ ] NO broken images

---

### 9. Mobile Responsiveness

Test on mobile device:

- [ ] All pages display correctly
- [ ] Booking grid works on mobile
- [ ] Checkout form usable on mobile
- [ ] Navigation menu works
- [ ] Phone number is clickable
- [ ] Email is clickable

---

### 10. Performance Check

- [ ] Page loads in < 3 seconds
- [ ] Images optimized
- [ ] No JavaScript errors
- [ ] Barion Pixel loads correctly

---

## 📝 Information for Barion Submission

When submitting to Barion, provide:

**Company Details:**
- Company name: Archilles Studio Korlátolt Felelősségű Társaság
- Short name: Archilles Studio Kft.
- Tax number: 32265105143
- Registry number: 01 09 415029
- Address: 1111 Budapest, Vak Bottyán utca 3. 6. emelet 1. ajtó
- Phone: +36 30 974 7362
- Email: studio@archilles.hu

**Website Details:**
- Production URL: [Your domain]
- Webhook URL: https://[your-domain]/api/webhooks/barion
- Business type: Photography Studio Rental
- Services: Hourly studio rental for photography

---

## ⚠️ Common Mistakes to Avoid

- ❌ DON'T submit test environment
- ❌ DON'T use test POS keys in production
- ❌ DON'T leave console.log visible (build strips them)
- ❌ DON'T submit without testing the full flow
- ❌ DON'T submit without SSL certificate
- ❌ DON'T have any "Coming soon" pages visible

---

## ✅ Ready to Submit Checklist

Before clicking "Submit for Review" in Barion:

- [ ] All company information is real (not placeholder)
- [ ] Production Barion credentials configured
- [ ] Website is live on real domain with HTTPS
- [ ] Webhook is publicly accessible
- [ ] Barion Pixel is installed and working
- [ ] Tested complete booking flow with real payment
- [ ] Invoice generation works (if enabled)
- [ ] All pages load without errors
- [ ] No console.log messages visible in production
- [ ] Mobile responsive
- [ ] Terms and Privacy pages complete
- [ ] Contact information is accurate

---

## 📞 Support Contacts

**If issues arise:**
- Barion: hello@barion.com / +36 1 699 0540
- Szamlazz.hu: info@szamlazz.hu / +36 1 700 4030

---

**Last Updated:** 2025-05-15
**Status:** Ready for production deployment

---

## 🚀 Deployment Commands

```bash
# Build frontend (strips console.log)
cd frontend
npm run build

# Deploy frontend build to your server
# (Upload 'dist' folder to your web server)

# Start backend in production
cd backend
NODE_ENV=production npm start

# Or with PM2
pm2 start npm --name "photo-studio-backend" -- start
```

Good luck! 🎉

