-- Add is_admin field to users table for admin role support
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Create index for admin lookup
CREATE INDEX idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- You can manually set a user as admin by running:
-- UPDATE users SET is_admin = true WHERE email = 'your-admin-email@example.com';

