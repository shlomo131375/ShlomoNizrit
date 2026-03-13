-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_phone TEXT,
  paypal_order_id TEXT,
  payment_method TEXT NOT NULL DEFAULT 'paypal',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  discount_amount INTEGER DEFAULT 0,
  coupon_code TEXT,
  download_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Server can insert orders (via anon key from API route)
CREATE POLICY "Allow insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Admin can read all orders
CREATE POLICY "Admin can read all orders"
  ON orders FOR SELECT
  USING (true);

-- Admin can update orders
CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);
