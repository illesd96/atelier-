-- ============================================================
-- Atelier Archilles Photo Studio - Database Setup
-- Run this SQL in Neon SQL Editor
-- ============================================================

-- ============================================================
-- 1. ROOMS/STUDIOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- 3. ORDER ITEMS TABLE (Individual time slots)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
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
-- 4. PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
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
-- 5. TEMPORARY RESERVATIONS TABLE (For cart functionality)
-- ============================================================
CREATE TABLE IF NOT EXISTS temp_reservations (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    UNIQUE(room_id, date, start_time)
);

-- ============================================================
-- 6. INDEXES FOR BETTER PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_booking_date ON order_items(booking_date);
CREATE INDEX IF NOT EXISTS idx_order_items_room_date ON order_items(room_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_payments_provider_ref ON payments(provider_ref);
CREATE INDEX IF NOT EXISTS idx_temp_reservations_expires ON temp_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_temp_reservations_session ON temp_reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_temp_reservations_slot ON temp_reservations(room_id, date, start_time);

-- ============================================================
-- 7. FUNCTION TO AUTO-UPDATE updated_at TIMESTAMP
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- 8. TRIGGERS TO AUTOMATICALLY UPDATE updated_at
-- ============================================================
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items;
CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 9. INSERT INITIAL DATA (4 Studios)
-- ============================================================
INSERT INTO rooms (id, name, description) VALUES
('studio-a', 'Studio A', 'Perfect for portrait photography'),
('studio-b', 'Studio B', 'Ideal for product photography'),
('studio-c', 'Studio C', 'Great for fashion shoots'),
('makeup', 'Makeup Studio', 'Professional makeup station')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 10. VERIFY SETUP
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
-- - 5 tables: rooms, orders, order_items, payments, temp_reservations
-- - 4 studios in the rooms table
-- ============================================================

