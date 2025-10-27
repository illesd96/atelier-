-- Migration to update database schema for FullCalendar integration
-- Run this if you have an existing database from the Cal.com version

-- Check if rooms table exists, if not create it
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add rooms if they don't exist
INSERT INTO rooms (id, name, description) VALUES
('studio-a', 'Atelier', 'Perfect for portrait photography'),
('studio-b', 'Frigyes', 'Ideal for product photography'),
('studio-c', 'Karinthy', 'Great for fashion shoots')
ON CONFLICT (id) DO NOTHING;

-- Update order_items table if cal_booking_id column exists
DO $$ 
BEGIN
    -- Check if cal_booking_id column exists and rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'cal_booking_id'
    ) THEN
        -- Rename the column
        ALTER TABLE order_items RENAME COLUMN cal_booking_id TO booking_id;
        
        -- Change the data type if needed
        ALTER TABLE order_items ALTER COLUMN booking_id TYPE VARCHAR(100);
    END IF;
    
    -- If booking_id column doesn't exist at all, create it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'booking_id'
    ) THEN
        ALTER TABLE order_items ADD COLUMN booking_id VARCHAR(100);
    END IF;
END $$;
