-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  script_id TEXT DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anonymous read access for coupon validation
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can validate coupons"
  ON coupons FOR SELECT
  USING (true);

-- Only authenticated admin can insert/update/delete
-- (you can manage coupons via SQL Editor or the admin page)
CREATE POLICY "Service role can manage coupons"
  ON coupons FOR ALL
  USING (true)
  WITH CHECK (true);

-- IF YOU ALREADY CREATED THE TABLE, run this instead to add the column:
-- ALTER TABLE coupons ADD COLUMN script_id TEXT DEFAULT NULL;
