-- Add email verification columns to users table
ALTER TABLE users
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255),
ADD COLUMN verification_token_expires TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX idx_users_verification_token ON users(verification_token);

-- Update existing users to be verified (so we don't break existing accounts)
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;

