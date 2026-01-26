# Website URLs Documentation

This document lists **ALL** URLs in the application and describes what each page is for.

**Legend:**
- ✅ = Included in sitemap.xml (public, indexable)
- ❌ = NOT in sitemap.xml (functional pages, not meant for search engines)
- 🔒 = Requires authentication
- 👑 = Admin only

---

## Quick Reference - All URLs

| # | Page Name | URL | Route | Status |
|---|-----------|-----|-------|--------|
| 1 | Homepage | `/` | `/` | ✅ |
| 2 | Booking | `/booking` | `/booking` | ✅ |
| 3 | FAQ | `/faq` | `/faq` | ✅ |
| 4 | Contact | `/contact` | `/contact` | ✅ |
| 5 | Terms | `/terms` | `/terms` | ✅ |
| 6 | Privacy | `/privacy` | `/privacy` | ✅ |
| 7 | Room: Atelier (Studio A) | `/rooms/studio-a` | `/rooms/studio-a` | ✅ |
| 8 | Room: Frigyes (Studio B) | `/rooms/studio-b` | `/rooms/studio-b` | ✅ |
| 9 | Room: Karinthy (Studio C) | `/rooms/studio-c` | `/rooms/studio-c` | ✅ |
| 10 | Special Event Booking | `/special-events/:eventId` | `/special-events/mikulas` | ❌ |
| 11 | Checkout | `/checkout` | `/checkout` | ❌ |
| 12 | Payment Result | `/payment/result` | `/payment/result?orderId=...` | ❌ |
| 13 | Login | `/login` | `/login` | ❌ |
| 14 | Register | `/register` | `/register` | ❌ |
| 15 | Email Verification | `/verify-email` | `/verify-email` | ❌ |
| 16 | User Profile | `/profile` | `/profile` | ❌ 🔒 |
| 17 | Admin Bookings | `/admin/bookings` | `/admin/bookings` | ❌ 👑 |
| 18 | Admin Schedule | `/admin/schedule` | `/admin/schedule` | ❌ 👑 |
| 19 | Admin Special Events | `/admin/special-events` | `/admin/special-events` | ❌ 👑 |
| 20 | Blog | `/blog` | `/blog` | ❌ |
| 21 | Blog Post | `/blog/:slug` | `/blog/example-post` | ❌ |
| 22 | 404 Not Found | `*` | Any invalid URL | ❌ |

---

## Main Public Pages (In Sitemap)

### 1. **Homepage** ✅
- **URL:** `https://www.atelier-archilles.hu/`
- **Route:** `/`
- **Purpose:** Main landing page for Atelier Archilles photo studio
- **Priority:** 1.0 (Highest)
- **Update Frequency:** Weekly
- **Languages:** Hungarian (HU) and English (EN)
- **Description:** The homepage serves as the primary entry point for visitors, showcasing the photo studio's services, features, and main call-to-action elements.

---

### 2. **Booking Page** ✅
- **URL:** `https://www.atelier-archilles.hu/booking`
- **Route:** `/booking`
- **Purpose:** Studio rental booking system
- **Priority:** 0.9 (Very High)
- **Update Frequency:** Daily
- **Languages:** Hungarian (HU) and English (EN)
- **Description:** This page allows customers to book time slots for renting the photo studio. It includes:
  - Available time slots and calendar
  - Studio options and pricing
  - Real-time availability checking
  - Payment processing integration (Barion)
  - Special events bookings

---

### 3. **FAQ Page** ✅
- **URL:** `https://www.atelier-archilles.hu/faq`
- **Route:** `/faq`
- **Purpose:** Frequently Asked Questions
- **Priority:** 0.8 (High)
- **Update Frequency:** Monthly
- **Languages:** Hungarian (HU) and English (EN)
- **Description:** Answers to common questions about:
  - Studio rental process
  - Equipment and facilities
  - Pricing and policies
  - Booking procedures
  - Cancellation terms

---

### 4. **Contact Page** ✅
- **URL:** `https://www.atelier-archilles.hu/contact`
- **Route:** `/contact`
- **Purpose:** Contact information and inquiry form
- **Priority:** 0.8 (High)
- **Update Frequency:** Monthly
- **Languages:** Hungarian (HU) and English (EN)
- **Description:** Provides multiple ways for visitors to get in touch:
  - Contact form
  - Email address
  - Phone number
  - Physical studio address
  - Operating hours
  - Map/location information

---

### 5. **Terms and Conditions** ✅
- **URL:** `https://www.atelier-archilles.hu/terms`
- **Route:** `/terms`
- **Purpose:** Terms and conditions of service
- **Priority:** 0.3 (Low)
- **Update Frequency:** Yearly
- **Languages:** Hungarian (HU) and English (EN)
- **Description:** Legal document outlining:
  - Studio rental terms
  - User responsibilities
  - Payment terms
  - Cancellation policy
  - Liability clauses
  - General terms of service

---

### 6. **Privacy Policy** ✅
- **URL:** `https://www.atelier-archilles.hu/privacy`
- **Route:** `/privacy`
- **Purpose:** Privacy policy and data protection information
- **Priority:** 0.3 (Low)
- **Update Frequency:** Yearly
- **Languages:** Hungarian (HU) and English (EN)
- **Description:** Legal document explaining:
  - Data collection practices
  - Cookie usage
  - GDPR compliance
  - User data protection
  - Third-party services (Google Analytics, Meta Pixel, etc.)
  - Data retention policies

---

## Studio Room Pages (In Sitemap)

### 7. **Atelier Room (Studio A)** ✅
- **URL:** `https://www.atelier-archilles.hu/rooms/studio-a`
- **Route:** `/rooms/studio-a`
- **Purpose:** Atelier studio room details
- **Priority:** 0.8 (High)
- **Update Frequency:** Monthly
- **Languages:** Hungarian (HU) and English (EN)
- **Description:** Detailed information about the Atelier studio:
  - Modern, minimalist, yet dramatic design
  - Rustic furnishings with natural colors
  - Christmas season: transforms into immersive snowy pine forest
  - Full gallery of studio photos
  - Equipment list and features
  - Pricing per hour
  - Direct "Book Now" functionality

---

### 8. **Frigyes Room (Studio B)** ✅
- **URL:** `https://www.atelier-archilles.hu/rooms/studio-b`
- **Route:** `/rooms/studio-b`
- **Purpose:** Frigyes studio room details
- **Priority:** 0.8 (High)
- **Update Frequency:** Monthly
- **Languages:** Hungarian (HU) and English (EN)
- **Description:** Detailed information about the Frigyes studio:
  - Clay and terracotta aesthetic
  - Perfect for product photography
  - Full gallery of studio photos
  - Equipment list and features
  - Pricing per hour
  - Direct "Book Now" functionality

---

### 9. **Karinthy Room (Studio C)** ✅
- **URL:** `https://www.atelier-archilles.hu/rooms/studio-c`
- **Route:** `/rooms/studio-c`
- **Purpose:** Karinthy studio room details
- **Priority:** 0.8 (High)
- **Update Frequency:** Monthly
- **Languages:** Hungarian (HU) and English (EN)
- **Description:** Detailed information about the Karinthy studio:
  - Classic elegance with modern twist
  - Olive green walls with moldings
  - Fireplace centerpiece
  - Christmas season: green and gold with black-white stripes
  - Full gallery of studio photos
  - Equipment list and features
  - Pricing per hour
  - Direct "Book Now" functionality

---

## Booking & E-commerce Flow (NOT in Sitemap)

### 10. **Special Event Booking Page** ❌
- **URL:** `https://www.atelier-archilles.hu/special-events/:eventId` (dynamic)
- **Route:** `/special-events/:eventId`
- **Purpose:** Booking page for special events (e.g., Santa photo sessions)
- **Description:** Dedicated booking interface for special events:
  - Event-specific time slots
  - Special pricing
  - Event details and descriptions
  - URL slug support (e.g., `/special-events/mikulas`)
  - Seasonal offerings

---

### 11. **Checkout Page** ❌
- **URL:** `https://www.atelier-archilles.hu/checkout`
- **Route:** `/checkout`
- **Purpose:** Payment and booking confirmation
- **Description:** Secure checkout process including:
  - Cart review
  - Customer information form
  - Billing details
  - Invoice options
  - Terms acceptance
  - Barion payment integration
  - Order finalization

---

### 12. **Payment Result Page** ❌ 🎯
- **URL:** `https://www.atelier-archilles.hu/payment/result`
- **Route:** `/payment/result?orderId=...`
- **Purpose:** Payment success/failure confirmation page
- **Description:** Post-payment landing page showing:
  - **Success state:** 
    - ✅ Order confirmation message
    - 📋 Booking codes for each reservation
    - 🔑 Check-in codes (generated after payment)
    - 📧 Email confirmation sent notification
    - 🏠 Return to home button
  - **Failed state:** 
    - ❌ Payment failed error message
    - 🔄 "Try Again" button to return to checkout
    - 🏠 Return to home option
  - **Cancelled state:** 
    - 🚫 Payment cancelled notification
    - 🛒 Cart preserved message
    - 🔄 Return to checkout option
    - 🏠 Return to home option
  - Order ID and reference numbers displayed
  - Connected to Barion payment gateway
  - Triggers Meta Pixel events for conversion tracking
  - Integrates with Szamlazz.hu for invoice generation

---

## User Authentication & Account (NOT in Sitemap)

### 13. **Login Page** ❌
- **URL:** `https://www.atelier-archilles.hu/login`
- **Route:** `/login`
- **Purpose:** User login authentication
- **Description:** Secure login form for:
  - Existing customer access
  - Email/password authentication
  - Remember me option
  - Password reset link
  - Redirect to registration

---

### 14. **Registration Page** ❌
- **URL:** `https://www.atelier-archilles.hu/register`
- **Route:** `/register`
- **Purpose:** New user account creation
- **Description:** Registration form including:
  - Name, email, password fields
  - Terms acceptance
  - Account creation
  - Email verification trigger

---

### 15. **Email Verification Page** ❌
- **URL:** `https://www.atelier-archilles.hu/verify-email`
- **Route:** `/verify-email`
- **Purpose:** Email address verification
- **Description:** Email confirmation page for:
  - Token-based verification
  - Account activation
  - Success/error messaging

---

### 16. **User Profile Page** ❌ 🔒
- **URL:** `https://www.atelier-archilles.hu/profile`
- **Route:** `/profile`
- **Purpose:** User account dashboard
- **Description:** Personal account management:
  - Booking history
  - Order information
  - Check-in codes
  - Account details
  - Past bookings review
  - Requires authentication

---

## Admin Pages (NOT in Sitemap)

### 17. **Admin Bookings Management** ❌ 👑
- **URL:** `https://www.atelier-archilles.hu/admin/bookings`
- **Route:** `/admin/bookings`
- **Purpose:** Administrative booking overview
- **Description:** Admin dashboard for managing:
  - All bookings list
  - Booking status
  - Customer information
  - Search and filter
  - Booking statistics
  - Revenue tracking
  - **Requires admin authentication**

---

### 18. **Admin Schedule Management** ❌ 👑
- **URL:** `https://www.atelier-archilles.hu/admin/schedule`
- **Route:** `/admin/schedule`
- **Purpose:** Administrative schedule control
- **Description:** Admin tools for:
  - Calendar view
  - Time slot management
  - Availability blocking
  - Schedule modifications
  - Room availability
  - **Requires admin authentication**

---

### 19. **Admin Special Events** ❌ 👑
- **URL:** `https://www.atelier-archilles.hu/admin/special-events`
- **Route:** `/admin/special-events`
- **Purpose:** Special events management
- **Description:** Admin interface for:
  - Creating special events
  - Event configuration
  - Pricing setup
  - URL slug management
  - Event descriptions
  - Seasonal event management (e.g., Santa photos)
  - **Requires admin authentication**

---

## Blog (NOT in Sitemap)

### 20. **Blog Page** ❌
- **URL:** `https://www.atelier-archilles.hu/blog`
- **Route:** `/blog`
- **Purpose:** Blog listing page
- **Description:** Collection of blog posts:
  - Photography tips
  - Studio news
  - Portfolio examples
  - Industry insights
  - **Note:** Currently implemented but may not be actively used

---

### 21. **Blog Post Page** ❌
- **URL:** `https://www.atelier-archilles.hu/blog/:slug` (dynamic)
- **Route:** `/blog/:slug`
- **Purpose:** Individual blog post
- **Description:** Single blog post with:
  - Full article content
  - Images
  - SEO optimization
  - Share options
  - **Note:** Currently implemented but may not be actively used

---

## Error Pages

### 22. **404 Not Found Page** ❌
- **URL:** Any non-existent URL
- **Route:** `*` (catch-all)
- **Purpose:** Error page for broken links
- **Description:** User-friendly 404 page with:
  - Error message
  - Navigation options
  - "Return to Home" button
  - Helpful links to main sections

---

## SEO Information

### Language Support
All pages support:
- **Hungarian (hu)** - Primary language
- **English (en)** - Secondary language
- **x-default** - Fallback for other languages

### Priority Levels Explained
- **1.0** - Homepage (most important)
- **0.9** - Booking page (primary conversion page)
- **0.8** - FAQ & Contact (important for customer service)
- **0.3** - Legal pages (required but low traffic)

### Update Frequency
- **Daily** - Booking page (due to time slots and availability)
- **Weekly** - Homepage (content updates and promotions)
- **Monthly** - FAQ & Contact (occasional updates)
- **Yearly** - Legal pages (infrequent changes)

---

## Summary Statistics

### Total Pages: 22

**By Category:**
- ✅ Public Pages in Sitemap: **9 pages** (Homepage, Booking, FAQ, Contact, Terms, Privacy, + 3 Studio Rooms)
- ❌ Functional Pages (Not in Sitemap): **13 pages**
  - Booking Flow: 2 pages
  - User Authentication: 4 pages
  - Admin Pages: 3 pages
  - Blog: 2 pages
  - Error Pages: 1 page
  - Special Events: 1 page

**By Access Level:**
- Public: 18 pages
- 🔒 Requires Authentication: 1 page (Profile)
- 👑 Admin Only: 3 pages (Admin Bookings, Schedule, Special Events)

---

## Why Some Pages Are NOT in Sitemap

Pages are excluded from the sitemap for various reasons:

1. **Functional Pages** - Pages like checkout, payment result are part of user flows, not entry points
2. **Dynamic Content** - Room details and special events use dynamic URLs
3. **Authentication Pages** - Login, register, verify-email are utility pages
4. **Admin Pages** - Not meant for public access or search engines
5. **User Account Pages** - Personal/private data pages (profile)
6. **Blog Pages** - May not be actively used or indexed yet
7. **Error Pages** - 404 pages shouldn't be indexed

---

## Complete User Journey Examples

### Typical Booking Flow:
1. **Homepage** (`/`) ✅ → Browse studios
2. **Room Detail** (`/rooms/studio-a`) ✅ → View specific studio
3. **Booking Page** (`/booking`) ✅ → Select time slot
4. **Checkout** (`/checkout`) → Enter details & pay
5. **Payment Result** (`/payment/result?orderId=123`) → Confirmation ✅/❌/🚫

### Special Event Flow (e.g., Santa Photos):
1. **Homepage** (`/`) → See special event banner
2. **Special Event Booking** (`/special-events/mikulas`) → Book Santa session
3. **Checkout** (`/checkout`) → Enter details & pay
4. **Payment Result** (`/payment/result?orderId=456`) → Confirmation ✅

### User Account Flow:
1. **Register** (`/register`) → Create account
2. **Email Verification** (`/verify-email`) → Confirm email
3. **Login** (`/login`) → Sign in
4. **Profile** (`/profile`) 🔒 → View bookings & check-in codes

### Admin Flow:
1. **Login** (`/login`) → Admin credentials
2. **Admin Bookings** (`/admin/bookings`) 👑 → Manage all bookings
3. **Admin Schedule** (`/admin/schedule`) 👑 → Control availability
4. **Admin Special Events** (`/admin/special-events`) 👑 → Create events

---

## Recommendations for Sitemap

### ✅ Recently Added to Sitemap (Done!):
- **Room Detail Pages** - All 3 studio rooms now included with priority 0.8
  - Atelier (Studio A) - `/rooms/studio-a`
  - Frigyes (Studio B) - `/rooms/studio-b`
  - Karinthy (Studio C) - `/rooms/studio-c`

### Consider Adding in Future:
- **Blog Page** (`/blog`) - If actively publishing content, should be in sitemap with priority 0.7
- **Blog Posts** (`/blog/:slug`) - Individual posts should be added dynamically as published
- **Special Event Pages** - If you have recurring/permanent events with stable URLs (e.g., `/special-events/mikulas`)

### Should Stay Out of Sitemap:
- Payment/Checkout pages (transactional)
- Authentication pages (utility)
- Admin pages (private)
- User profile (private)
- 404 page (error)

---

## Notes

- All URLs use HTTPS for secure connections
- The sitemap was last updated on 2025-11-03
- The website supports bilingual content (Hungarian/English)
- The domain is: `www.atelier-archilles.hu`
- Payment processing uses Barion gateway
- All authenticated pages use JWT tokens
- Dynamic routes use URL parameters (`:roomId`, `:eventId`, `:slug`)
