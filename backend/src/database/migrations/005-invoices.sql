-- Create invoices table to store Szamlazz.hu invoice data
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Szamlazz.hu data
  szamlazz_id VARCHAR(255), -- Szamlazz.hu internal invoice ID
  invoice_number VARCHAR(100) NOT NULL, -- The visible invoice number (e.g., PHOTO-2025-001)
  invoice_type VARCHAR(50) NOT NULL DEFAULT 'normal', -- normal, proforma, deposit, etc.
  
  -- Invoice details
  gross_amount DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  vat_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'HUF',
  
  -- Customer info (stored for record keeping)
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_tax_number VARCHAR(50),
  
  -- PDF storage
  pdf_url TEXT, -- URL or path to stored PDF
  pdf_data BYTEA, -- Optional: store PDF binary data
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'generated', -- generated, sent, cancelled, reversed
  sent_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Metadata
  szamlazz_response JSON, -- Full response from Szamlazz.hu
  error_message TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_szamlazz_id ON invoices(szamlazz_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Add invoice_id reference to orders table (optional, for quick lookup)
ALTER TABLE orders
ADD COLUMN invoice_id UUID REFERENCES invoices(id);

