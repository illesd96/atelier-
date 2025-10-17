-- Migration: Add email logs table
-- This table tracks sent emails to avoid duplicate reminders

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL, -- 'confirmation', 'reminder', 'cancellation', etc.
  booking_date DATE, -- NULL for emails not specific to a booking date
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for efficient querying
  CONSTRAINT unique_reminder_per_booking UNIQUE (order_id, email_type, booking_date)
);

-- Index for finding sent reminders
CREATE INDEX IF NOT EXISTS idx_email_logs_order_type_date ON email_logs(order_id, email_type, booking_date);

-- Index for cleanup and reporting
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- Comments for documentation
COMMENT ON TABLE email_logs IS 'Tracks all sent emails to prevent duplicates and provide audit trail';
COMMENT ON COLUMN email_logs.email_type IS 'Type of email: confirmation, reminder, cancellation, payment-failed';
COMMENT ON COLUMN email_logs.booking_date IS 'Specific booking date for reminders, NULL for general emails';

