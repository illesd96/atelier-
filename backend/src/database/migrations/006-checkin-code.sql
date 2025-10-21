-- Add check-in code to order_items
-- Simple 6-character alphanumeric code for easy verification at studio

ALTER TABLE order_items
ADD COLUMN checkin_code VARCHAR(10) UNIQUE;

-- Create index for quick lookup
CREATE INDEX idx_order_items_checkin_code ON order_items(checkin_code);

-- Update existing records with generated codes (optional, for migration)
-- This will be handled by the application code for new bookings

