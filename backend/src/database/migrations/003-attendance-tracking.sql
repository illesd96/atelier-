-- Add attendance tracking to order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS attendance_status VARCHAR(20) DEFAULT 'pending' 
CHECK (attendance_status IN ('pending', 'showed_up', 'no_show', 'cancelled'));

-- Add index for attendance queries
CREATE INDEX IF NOT EXISTS idx_order_items_attendance ON order_items(attendance_status);

-- Add notes field for admin comments
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

