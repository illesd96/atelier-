-- ============================================================
-- Atelier Archilles Photo Studio - Local Database Setup
-- Complete script to set up database from scratch
-- ============================================================
-- This script will:
-- 1. Drop existing tables (if any)
-- 2. Create all tables from scratch
-- 3. Insert initial data (4 studios)
-- ============================================================

-- Clean slate: Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS temp_reservations CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;

-- ============================================================
-- 1. ROOMS/STUDIOS TABLE
-- ============================================================
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. USERS TABLE (For authentication)
-- ============================================================
CREATE TABLE users (
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

-- ============================================================
-- 3. USER ADDRESSES TABLE (For saved billing info)
-- ============================================================
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(200),
    tax_number VARCHAR(50),
    address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. ORDERS TABLE
-- ============================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'cancelled')),
    language VARCHAR(2) NOT NULL CHECK (language IN ('hu', 'en')),
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'HUF',
    invoice_required BOOLEAN DEFAULT false,
    invoice_company VARCHAR(200),
    invoice_tax_number VARCHAR(50),
    invoice_address TEXT,
    terms_accepted BOOLEAN NOT NULL DEFAULT false,
    privacy_accepted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. ORDER ITEMS TABLE (Individual time slots)
-- ============================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    room_id VARCHAR(50) NOT NULL REFERENCES rooms(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    booking_id VARCHAR(100), -- Internal booking ID
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'cancelled', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. PAYMENTS TABLE
-- ============================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL DEFAULT 'barion',
    provider_ref VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payload_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. TEMPORARY RESERVATIONS TABLE (For cart functionality)
-- ============================================================
CREATE TABLE temp_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id VARCHAR(50) NOT NULL REFERENCES rooms(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    UNIQUE(room_id, date, start_time)
);

-- ============================================================
-- 8. INDEXES FOR BETTER PERFORMANCE
-- ============================================================
-- Users indexes
CREATE INDEX idx_users_email ON users(email);

-- User addresses indexes
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);

-- Orders indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_booking_date ON order_items(booking_date);
CREATE INDEX idx_order_items_room_date ON order_items(room_id, booking_date);

-- Payments indexes
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_provider_ref ON payments(provider_ref);

-- Temp reservations indexes
CREATE INDEX idx_temp_reservations_expires ON temp_reservations(expires_at);
CREATE INDEX idx_temp_reservations_session ON temp_reservations(session_id);
CREATE INDEX idx_temp_reservations_slot ON temp_reservations(room_id, date, start_time);

-- ============================================================
-- 9. FUNCTION TO AUTO-UPDATE updated_at TIMESTAMP
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- 10. TRIGGERS TO AUTOMATICALLY UPDATE updated_at
-- ============================================================
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at 
    BEFORE UPDATE ON user_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 11. INSERT INITIAL DATA (4 Studios)
-- ============================================================
INSERT INTO rooms (id, name, description, active) VALUES
    ('studio-a', 'Atelier', 'Perfect for portrait photography', true),
    ('studio-b', 'Frigyes', 'Ideal for product photography', true),
    ('studio-c', 'Karinthy', 'Great for fashion shoots', true),
    ('makeup', 'Makeup Studio', 'Professional makeup station', true);

-- ============================================================
-- 12. VERIFY SETUP
-- ============================================================
-- Check all tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check initial data
SELECT * FROM rooms;

-- ============================================================
-- SETUP COMPLETE! ✅
-- ============================================================
-- You should see:
-- - 7 tables: rooms, users, user_addresses, orders, order_items, payments, temp_reservations
-- - 4 studios in the rooms table
-- ============================================================

-- ============================================================
-- OPTIONAL: Create a test user (password: "test123")
-- ============================================================
-- To create a test user, run this (after installing bcrypt and generating a hash):
-- INSERT INTO users (email, password_hash, name, phone, email_verified, active)
-- VALUES (
--     'test@example.com',
--     '$2b$10$YourBcryptHashHere', -- Use bcrypt to hash "test123"
--     'Test User',
--     '06301234567',
--     true,
--     true
-- );

-- ============================================================
-- CLEANUP OLD RESERVATIONS (Run periodically)
-- ============================================================
-- To clean up expired reservations, run:
-- DELETE FROM temp_reservations WHERE expires_at < CURRENT_TIMESTAMP;

