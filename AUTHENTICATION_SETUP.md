# Authentication System Setup Guide

This guide covers the setup and usage of the new user registration and login system for the Photo Studio booking platform.

## Overview

The authentication system allows users to:
- Register for an account
- Login to save their information
- View their booking history
- Save invoice/billing addresses
- Checkout faster with pre-filled information
- **Guest checkout is still available** - registration is optional

## 🚀 Features Implemented

### Backend
- ✅ User registration with password hashing (bcrypt)
- ✅ JWT-based authentication
- ✅ Secure password storage
- ✅ User profile management
- ✅ Order history tracking
- ✅ Saved billing addresses
- ✅ Optional authentication for checkout (guests can still checkout)

### Frontend
- ✅ Login page with modern UI
- ✅ Registration page
- ✅ User profile page with:
  - Profile information editing
  - Password change functionality
  - Order history with expandable details
  - Logout functionality
- ✅ Pre-filled checkout form for logged-in users
- ✅ Login/Profile button in header
- ✅ Multi-language support (English & Hungarian)

## 📦 Installation Steps

### 1. Install New Dependencies

#### Backend
```bash
cd backend
npm install bcrypt jsonwebtoken
npm install --save-dev @types/bcrypt @types/jsonwebtoken
```

#### Frontend
No new dependencies required - authentication uses existing packages.

### 2. Database Migration

Run the migration to add users and authentication tables:

```sql
-- For Neon/PostgreSQL database
psql $DATABASE_URL -f backend/src/database/migrations/003-add-users-and-auth.sql
```

Or manually run the SQL in your database console:
```sql
-- Creates:
-- 1. users table with authentication fields
-- 2. user_addresses table for saved billing addresses
-- 3. Adds user_id column to orders table
-- 4. Creates necessary indexes and triggers
```

### 3. Environment Configuration

Ensure your `.env` file has the JWT secret:

```env
# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**⚠️ IMPORTANT:** Use a strong, random JWT secret in production!

Generate a secure secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 64
```

### 4. Build and Deploy

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
```

## 🔐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/profile` | Yes | Get current user profile |
| PUT | `/api/auth/profile` | Yes | Update user profile |
| PUT | `/api/auth/password` | Yes | Change password |

### User Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/user/orders` | Yes | Get order history |
| GET | `/api/user/addresses` | Yes | Get saved addresses |
| POST | `/api/user/addresses` | Yes | Save new address |
| DELETE | `/api/user/addresses/:id` | Yes | Delete address |

### Modified Endpoints

- `POST /api/checkout` - Now accepts optional JWT token to link orders to users

## 🎨 Frontend Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/login` | Login page | No |
| `/register` | Registration page | No |
| `/profile` | User profile & order history | Yes |
| `/checkout` | Checkout (pre-fills data if logged in) | No |

## 💻 Usage Examples

### Registration

```typescript
// Frontend example
const { register } = useAuth();

const result = await register(
  'user@example.com',
  'securePassword123',
  'John Doe',
  '+36 20 123 4567' // optional
);

if (result.success) {
  // User is now registered and logged in
  // Token is automatically stored
}
```

### Login

```typescript
const { login } = useAuth();

const result = await login('user@example.com', 'securePassword123');

if (result.success) {
  // User is logged in
  // Navigate to booking or profile
}
```

### Checking Authentication

```typescript
const { isAuthenticated, user } = useAuth();

if (isAuthenticated) {
  console.log('Logged in as:', user.name);
  console.log('Email:', user.email);
}
```

### Guest Checkout

Users can still checkout without registration. The checkout form works the same way, but logged-in users will have their information pre-filled.

## 🗄️ Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_login_at TIMESTAMP
)
```

### User Addresses Table
```sql
user_addresses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  company VARCHAR(200),
  tax_number VARCHAR(50),
  address TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Orders Table Update
```sql
-- New column added
user_id UUID REFERENCES users(id) -- Optional, NULL for guest orders
```

## 🔒 Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: 7-day expiration, can be configured
3. **Token Verification**: All protected routes verify JWT token validity
4. **SQL Injection Protection**: Using parameterized queries
5. **CORS Configuration**: Restricted to allowed origins
6. **Rate Limiting**: Already configured in existing setup

## 🌍 Internationalization

All authentication UI is fully translated in:
- English (`en.json`)
- Hungarian (`hu.json`)

Translation keys added:
- `login.*` - Login page translations
- `register.*` - Registration page translations
- `profile.*` - Profile page translations

## 🎯 User Flow

### For New Users
1. User browses and adds bookings to cart
2. At checkout, they see option to login/register
3. They can click "Create Account" or continue as guest
4. If they register, their info is saved for future bookings

### For Returning Users
1. User clicks "Login" in header
2. After login, they're redirected to their intended page
3. Their info is pre-filled in checkout
4. They can view order history in their profile

### Profile Features
- Edit name and phone number
- Change password securely
- View all past orders
- Expand order details to see booking items
- Logout

## 🧪 Testing

### Test User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User",
    "phone": "+36 20 123 4567"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Test Profile Access
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚨 Troubleshooting

### "Table users does not exist"
Run the migration: `backend/src/database/migrations/003-add-users-and-auth.sql`

### "Invalid or expired token"
Token might be expired (7 days). User needs to login again.

### "Email already exists"
User is trying to register with an existing email. Direct them to login.

### User data not pre-filling in checkout
- Check that user is logged in (check `isAuthenticated`)
- Verify token is being passed to API calls
- Check browser console for errors

## 📱 Mobile Responsiveness

All authentication pages are fully responsive:
- Login page
- Registration page  
- Profile page
- Works seamlessly on mobile devices

## 🔄 Migration from Guest to User

Existing guest orders remain in the database. Once a user registers with the same email, future orders will be automatically linked to their account.

## ⚙️ Configuration Options

### Token Expiration
Edit `backend/src/services/auth.ts`:
```typescript
const JWT_EXPIRES_IN = '7d'; // Change to '1d', '30d', etc.
```

### Password Requirements
Edit `backend/src/controllers/user.ts` validation schema:
```typescript
password: z.string().min(8, 'Password must be at least 8 characters')
// Change minimum length or add complexity requirements
```

## 📚 Additional Resources

- [bcrypt documentation](https://www.npmjs.com/package/bcrypt)
- [jsonwebtoken documentation](https://www.npmjs.com/package/jsonwebtoken)
- [JWT.io](https://jwt.io/) - For debugging JWT tokens

## 🎉 Summary

The authentication system is now fully integrated and ready to use! Users can:
- ✅ Register and login
- ✅ Save their information for future bookings
- ✅ View their booking history
- ✅ Still checkout as guests if they prefer

The system is secure, scalable, and provides a better user experience for returning customers while maintaining the flexibility of guest checkout.

