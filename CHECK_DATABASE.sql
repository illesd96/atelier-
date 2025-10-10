-- Run these queries in your Neon/Production database console to diagnose the issue

-- 1. Check if user_addresses table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_addresses'
ORDER BY ordinal_position;

-- 2. Check if users table has the necessary records
SELECT id, email, name, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check current addresses (if table exists)
SELECT * FROM user_addresses;

-- 4. If table doesn't exist, create it:
/*
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

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

CREATE TRIGGER IF NOT EXISTS update_user_addresses_updated_at 
    BEFORE UPDATE ON user_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
*/

-- 5. Test insert (replace USER_ID with actual user ID from step 2)
/*
INSERT INTO user_addresses (user_id, company, tax_number, address, is_default)
VALUES ('YOUR_USER_ID_HERE', 'Test Company', '12345678', 'Test Street, 1000 Test City, Hungary', true)
RETURNING *;
*/

