# Local Development Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running locally
- npm or yarn package manager

## Step 1: Database Setup

### Create Local Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE atelier_photo_studio;

# Connect to the database
\c atelier_photo_studio

# Exit psql
\q
```

### Run the Setup Script

```bash
# Run the complete setup script
psql -U postgres -d atelier_photo_studio -f LOCAL_DATABASE_SETUP.sql
```

This will:
- Drop any existing tables (fresh start)
- Create all 7 tables (rooms, users, user_addresses, orders, order_items, payments, temp_reservations)
- Add all indexes and triggers
- Insert 4 initial studios

### Verify Setup

```bash
psql -U postgres -d atelier_photo_studio

# Check tables
\dt

# Check studios
SELECT * FROM rooms;

# Exit
\q
```

You should see:
- 7 tables listed
- 4 studios (studio-a, studio-b, studio-c, makeup)

## Step 2: Environment Variables

### Backend (.env)

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/atelier_photo_studio

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Barion Payment Gateway
BARION_ENVIRONMENT=test
BARION_POS_KEY=your_test_pos_key_here
BARION_PIXEL_ID=your_pixel_id_here
BARION_PAYEE_EMAIL=your_email@example.com

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random

# Email Configuration (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### Frontend (.env)

Create `frontend/.env`:

```env
# API URL
VITE_API_URL=http://localhost:3001/api
```

## Step 3: Install Dependencies

```bash
# From project root
npm install

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

## Step 4: Build TypeScript

```bash
# From project root
npm run build

# Or build individually
npm run build:backend
npm run build:frontend
```

## Step 5: Run Development Servers

### Option 1: Run Both Servers Together

```bash
# From project root
npm run dev
```

This runs:
- Backend on http://localhost:3001
- Frontend on http://localhost:5173

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 6: Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/api/health

## Step 7: Test the Application

1. **Open the booking page:** http://localhost:5173/booking
2. **Select a date and time slot**
3. **Add to cart**
4. **Proceed to checkout**
5. **Fill out the form**
6. **Submit** (in test mode, it will try to create a Barion payment)

## Troubleshooting

### Database Connection Error

**Error:** `Cannot connect to database`

**Solution:**
1. Make sure PostgreSQL is running: `sudo service postgresql status`
2. Check your `DATABASE_URL` in `backend/.env`
3. Verify database exists: `psql -U postgres -l`

### CORS Error

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. Check `FRONTEND_URL` in `backend/.env` matches your frontend URL
2. Restart backend server after changing .env

### Build Errors

**Error:** `Cannot find module` or TypeScript errors

**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm package-lock.json
npm install
```

### Port Already in Use

**Error:** `Port 3001 is already in use`

**Solution:**
```bash
# Find and kill the process
# On Linux/Mac
lsof -ti:3001 | xargs kill -9

# On Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Barion Payment Error

**Error:** `Failed to create payment in Barion`

**Solution:**
1. Make sure you have a Barion test account
2. Get your test POS key from Barion dashboard
3. Set `BARION_ENVIRONMENT=test` in backend/.env
4. Set your `BARION_POS_KEY` in backend/.env

## Database Maintenance

### Reset Database

To completely reset the database:

```bash
psql -U postgres -d atelier_photo_studio -f LOCAL_DATABASE_SETUP.sql
```

### Clean Up Expired Reservations

```bash
psql -U postgres -d atelier_photo_studio -c "DELETE FROM temp_reservations WHERE expires_at < CURRENT_TIMESTAMP;"
```

### View Recent Orders

```bash
psql -U postgres -d atelier_photo_studio -c "SELECT id, customer_name, email, status, total_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 10;"
```

### Check Bookings for a Date

```bash
psql -U postgres -d atelier_photo_studio -c "SELECT oi.room_id, oi.booking_date, oi.start_time, oi.end_time, oi.status, o.customer_name FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.booking_date = '2025-10-14' ORDER BY oi.start_time;"
```

## Development Workflow

1. **Make code changes**
2. **Backend TypeScript changes:**
   - Automatic reload with `npm run dev` (uses nodemon)
3. **Frontend changes:**
   - Automatic hot reload with Vite
4. **Database schema changes:**
   - Create migration file in `backend/src/database/migrations/`
   - Run migration manually: `psql -U postgres -d atelier_photo_studio -f backend/src/database/migrations/YOUR_MIGRATION.sql`

## Testing Checkout Flow

### Test Credit Card Numbers (Barion Test Environment)

- **Successful payment:** 9999-9999-9999-9990
- **Failed payment:** 9999-9999-9999-9991
- **Expired date:** Any future date
- **CVC:** Any 3 digits

### Test User Registration

```bash
# Create a test user (password: "test123")
# First, generate bcrypt hash for "test123"
# You can use online tools or:
node -e "console.log(require('bcrypt').hashSync('test123', 10))"

# Then insert:
psql -U postgres -d atelier_photo_studio
INSERT INTO users (email, password_hash, name, phone, email_verified, active)
VALUES (
    'test@example.com',
    '$2b$10$KIXcbQvQZ7XxN9qZmN9xXeN9qZmN9xXeN9qZmN9xXe', -- Replace with actual hash
    'Test User',
    '06301234567',
    true,
    true
);
```

## Production Deployment

See these guides:
- `DEPLOYMENT.md` - General deployment guide
- `VERCEL_ENV_VARIABLES.md` - Vercel environment variables
- `BARION_SETUP_PRODUCTION.md` - Barion production setup
- `PRODUCTION_DATABASE_MIGRATION.md` - Production database setup

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel logs (for production)
3. Check browser console for frontend errors
4. Check terminal output for backend errors
5. Review PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-14-main.log`

