-- Table for managing per-user benefits (coupons and free scripts)
CREATE TABLE user_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_name TEXT,
  benefit_type TEXT NOT NULL, -- 'coupon' or 'free_script'
  coupon_code TEXT,           -- for coupon type
  script_id TEXT,             -- for free_script type
  used BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_benefits ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Full access for user_benefits"
  ON user_benefits FOR ALL
  USING (true)
  WITH CHECK (true);
