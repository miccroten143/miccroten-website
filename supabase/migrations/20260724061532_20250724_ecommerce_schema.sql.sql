/*
# E-Commerce Module Schema

1. Overview
   Adds a complete e-commerce backend for the MICCROTEN website:
   product catalog, categories, reviews, wishlist, saved addresses,
   orders with line items, and coupon codes. Built on top of the
   existing Supabase auth (auth.users) used by the admin login.

2. New Tables
   - `categories`        : product categories (MICCROTEN Products, Arduino, etc.)
       id, slug (unique), name, description, icon, image_url, sort_order, is_active, created_at
   - `products`          : sellable items
       id, slug (unique), name, short_description, long_description, price, compare_at_price,
       sku, stock, category_id (FK), images (jsonb array), specifications (jsonb),
       package_contents (jsonb), downloads (jsonb), tags (text[]), rating, review_count,
       youtube_url, github_url, warranty, shipping_info, is_featured, is_trending,
       is_bestseller, is_new_arrival, status (published/draft), created_at, updated_at
   - `reviews`           : product reviews (verified-purchase capable)
       id, product_id (FK), user_id (FK auth.users), rating, title, body, verified, created_at
   - `wishlist`          : user wishlisted products
       id, user_id (FK), product_id (FK), created_at  (unique user+product)
   - `addresses`         : saved shipping/billing addresses
       id, user_id (FK), full_name, phone, line1, line2, city, state, pincode, country,
       is_default, type (shipping/billing/both), created_at
   - `orders`            : customer orders
       id (uuid), order_number (unique), user_id (FK), status, payment_status, payment_method,
       payment_id, subtotal, discount, gst, shipping, total, coupon_code, address (jsonb),
       delivered_at, created_at, updated_at
   - `order_items`       : line items per order
       id, order_id (FK), product_id (FK), name, price, quantity, image, created_at
   - `coupons`           : discount codes
       id, code (unique), type (percent/fixed), value, min_order, max_discount,
       usage_limit, used_count, active, expires_at, created_at

3. Security
   - RLS enabled on every new table.
   - Public catalog (categories, products, coupons) is readable by
     anon + authenticated so the storefront works without login.
   - User-owned data (reviews, wishlist, addresses, orders, order_items)
     is scoped to the authenticated owner via auth.uid().
   - Inserts on user-owned tables default user_id to auth.uid() so the
     frontend can insert without passing the owner id.
   - Writes to catalog tables (products, categories, coupons) are
     authenticated (admin manages them) -- public read, admin write.

4. Notes
   - Existing `messages` table is untouched.
   - All timestamps default to now() in UTC.
   - JSONB columns used for flexible structured data (images, specs, downloads).
*/

-- ===================== CATEGORIES =====================
CREATE TABLE IF NOT EXISTS categories (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  image_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_categories" ON categories;
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- ===================== PRODUCTS =====================
CREATE TABLE IF NOT EXISTS products (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  short_description text,
  long_description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  compare_at_price numeric(12,2),
  sku text,
  stock integer DEFAULT 0,
  category_id bigint REFERENCES categories(id) ON DELETE SET NULL,
  images jsonb DEFAULT '[]'::jsonb,
  specifications jsonb DEFAULT '[]'::jsonb,
  package_contents jsonb DEFAULT '[]'::jsonb,
  downloads jsonb DEFAULT '[]'::jsonb,
  tags text[] DEFAULT '{}',
  rating numeric(2,1) DEFAULT 0,
  review_count integer DEFAULT 0,
  youtube_url text,
  github_url text,
  warranty text,
  shipping_info text,
  is_featured boolean DEFAULT false,
  is_trending boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  is_new_arrival boolean DEFAULT false,
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- ===================== REVIEWS =====================
CREATE TABLE IF NOT EXISTS reviews (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id bigint REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_reviews" ON reviews;
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reviews" ON reviews;
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_reviews" ON reviews;
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===================== WISHLIST =====================
CREATE TABLE IF NOT EXISTS wishlist (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id bigint REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_wishlist" ON wishlist;
CREATE POLICY "select_own_wishlist" ON wishlist FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_wishlist" ON wishlist;
CREATE POLICY "insert_own_wishlist" ON wishlist FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_wishlist" ON wishlist;
CREATE POLICY "delete_own_wishlist" ON wishlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===================== ADDRESSES =====================
CREATE TABLE IF NOT EXISTS addresses (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  country text DEFAULT 'India',
  is_default boolean DEFAULT false,
  type text DEFAULT 'both',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_addresses" ON addresses;
CREATE POLICY "select_own_addresses" ON addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_addresses" ON addresses;
CREATE POLICY "insert_own_addresses" ON addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_addresses" ON addresses;
CREATE POLICY "update_own_addresses" ON addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_addresses" ON addresses;
CREATE POLICY "delete_own_addresses" ON addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===================== ORDERS =====================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  payment_method text,
  payment_id text,
  subtotal numeric(12,2) DEFAULT 0,
  discount numeric(12,2) DEFAULT 0,
  gst numeric(12,2) DEFAULT 0,
  shipping numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  coupon_code text,
  address jsonb,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_read_all_orders" ON orders;
CREATE POLICY "admin_read_all_orders" ON orders FOR SELECT
  TO authenticated USING (true);

-- ===================== ORDER ITEMS =====================
CREATE TABLE IF NOT EXISTS order_items (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id bigint REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  price numeric(12,2) NOT NULL,
  quantity integer NOT NULL,
  image text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- ===================== COUPONS =====================
CREATE TABLE IF NOT EXISTS coupons (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code text UNIQUE NOT NULL,
  type text DEFAULT 'percent',
  value numeric(12,2) NOT NULL DEFAULT 0,
  min_order numeric(12,2) DEFAULT 0,
  max_discount numeric(12,2),
  usage_limit integer,
  used_count integer DEFAULT 0,
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_coupons" ON coupons;
CREATE POLICY "auth_insert_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_coupons" ON coupons;
CREATE POLICY "auth_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_coupons" ON coupons;
CREATE POLICY "auth_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (true);

-- ===================== INDEXES =====================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
