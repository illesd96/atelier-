# Production Database Migration Guide

## Issue: 500 Error on `/api/availability` endpoint

The availability endpoint is failing with a 500 error in production. This is likely due to:
1. Database connection issues
2. Missing migrations
3. Missing database tables

## Solution: Run Database Migrations in Production

### Step 1: Access Your Neon Database Console

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. Go to the **SQL Editor** tab

### Step 2: Check Current Database State

Run this query to see what tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- `rooms`
- `orders`
- `order_items`
- `temp_reservations`
- `users`
- `user_addresses`

### Step 3: Run Missing Migrations

If any tables are missing, run the migrations in order:

#### Migration 001: Initial Schema

```sql
-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER,
    hourly_rate DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'HUF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    barion_payment_id VARCHAR(100),
    payment_redirect_url TEXT,
    company VARCHAR(200),
    tax_number VARCHAR(50),
    billing_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    room_id VARCHAR(50) NOT NULL REFERENCES rooms(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    booking_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_booking_date ON order_items(booking_date);
CREATE INDEX IF NOT EXISTS idx_order_items_room_id ON order_items(room_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default rooms
INSERT INTO rooms (id, name, capacity, hourly_rate, currency) VALUES
    ('studio-a', 'Studio A', 4, 15000, 'HUF'),
    ('studio-b', 'Studio B', 6, 20000, 'HUF'),
    ('studio-c', 'Studio C', 8, 25000, 'HUF')
ON CONFLICT (id) DO NOTHING;
```

#### Migration 002: Temp Reservations

```sql
-- Create temp_reservations table
CREATE TABLE IF NOT EXISTS temp_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id VARCHAR(50) NOT NULL REFERENCES rooms(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_temp_reservations_session ON temp_reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_temp_reservations_expires ON temp_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_temp_reservations_slot ON temp_reservations(room_id, date, start_time);
```

#### Migration 003: Users and Authentication

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Add user_id to orders table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(200),
    tax_number VARCHAR(50),
    address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- Update triggers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
    ) THEN
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_addresses_updated_at'
    ) THEN
        CREATE TRIGGER update_user_addresses_updated_at 
            BEFORE UPDATE ON user_addresses 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
```

### Step 4: Verify Migrations

After running the migrations, verify that all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Step 5: Test the Availability Endpoint

Try accessing the availability endpoint again:
```
https://atelier-backend-ivory.vercel.app/api/availability?date=2025-10-10
```

## Troubleshooting

### If you still get 500 errors:

1. **Check Vercel Logs:**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Select your backend project
   - Click on "Logs" tab
   - Look for error messages

2. **Check DATABASE_URL:**
   - Go to Vercel → Project → Settings → Environment Variables
   - Ensure `DATABASE_URL` is set correctly
   - It should look like: `postgresql://user:password@host/database?sslmode=require`

3. **Check Database Connection:**
   Run this in Neon SQL Editor:
   ```sql
   SELECT current_database(), current_user, version();
   ```

4. **Check for Errors in Backend Code:**
   The backend has error handling that should log to Vercel logs. Check for:
   - Database connection errors
   - Query syntax errors
   - Permission issues

## Quick Fix: Run All Migrations at Once

If you want to run all migrations in one go, use this combined script:

```sql
-- See the file: NEON_DATABASE_SETUP.sql in the project root
```

This should be run in your Neon database console.

## After Fixing

Once the database is set up correctly:
1. The availability endpoint should work
2. Users can register and login
3. Saved addresses will be stored
4. Order history will be tracked

## Notes

- The backend code has built-in error handling for missing tables
- If tables don't exist, it should return all slots as available
- The 500 error suggests a more fundamental database connection issue
- Check the Vercel logs for the actual error message

