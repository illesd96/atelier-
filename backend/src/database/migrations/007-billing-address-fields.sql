-- Add separate billing address fields to orders table
-- This allows proper Szamlazz.hu invoice generation with city, zip, etc.

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS billing_street VARCHAR(255),
ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS billing_zip VARCHAR(20),
ADD COLUMN IF NOT EXISTS billing_country VARCHAR(100) DEFAULT 'HU';

-- Migrate existing invoice_address data to billing_street
-- (invoice_address will remain for backward compatibility)
UPDATE orders 
SET billing_street = invoice_address
WHERE invoice_address IS NOT NULL AND billing_street IS NULL;

