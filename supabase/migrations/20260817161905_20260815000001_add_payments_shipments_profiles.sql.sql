-- Apply existing payments/shipments/profiles migration
-- Source: 20260815095642_20260815000001_add_payments_shipments_profiles.sql

ALTER TABLE addresses ADD COLUMN IF NOT EXISTS alternate_number text;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS landmark text;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS address_type text DEFAULT 'home';
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery date;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_created_at timestamptz;

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_payments" ON payments;
CREATE POLICY "update_own_payments" ON payments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment ON payments(razorpay_payment_id);

CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  shiprocket_order_id text,
  shipment_id text,
  awb_code text,
  courier_name text,
  courier_company_id integer,
  tracking_number text,
  tracking_url text,
  shipment_status text DEFAULT 'pending',
  estimated_delivery date,
  shipped_at timestamptz,
  delivered_at timestamptz,
  pickup_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_shipments" ON shipments;
CREATE POLICY "select_own_shipments" ON shipments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_shipments" ON shipments;
CREATE POLICY "insert_own_shipments" ON shipments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_shipments" ON shipments;
CREATE POLICY "update_own_shipments" ON shipments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_shipments" ON shipments;
CREATE POLICY "delete_own_shipments" ON shipments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_user ON shipments(user_id);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone_number text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text,
  title text,
  body text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
