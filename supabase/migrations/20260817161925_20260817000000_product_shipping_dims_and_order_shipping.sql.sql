/*
# Product shipping dimensions + order shipping preservation

## Purpose
Supports product-specific shipping details (weight/dimensions) for
Shiprocket order creation, and preserves the shipping info used for
each order at checkout time so it survives later product edits.

## Changes

### 1. products — new columns
- `weight_kg`   numeric(8,3) — product shipping weight in kg (default 0.5)
- `length_cm`   numeric(8,2) — package length in cm (default 10)
- `width_cm`    numeric(8,2) — package width in cm (default 10)
- `height_cm`   numeric(8,2) — package height in cm (default 10)

### 2. order_items — new columns (preserved per-order shipping dims)
- `weight_kg`   numeric(8,3)
- `length_cm`   numeric(8,2)
- `width_cm`    numeric(8,2)
- `height_cm`    numeric(8,2)

### 3. orders — new columns
- `origin_pincode`          text — MICCROTEN pickup pincode used
- `destination_pincode`     text — customer delivery pincode
- `shipping_courier_id`     integer — selected Shiprocket courier id
- `shipping_courier_name`   text — selected courier display name
- `shipping_estimated_days` integer — estimated delivery days
- `shipping_rate_id`       text — Shiprocket rate id (if any)

### 4. shipments — new columns
- `origin_pincode`          text
- `destination_pincode`     text

## Security
No new tables. Existing RLS policies cover all modified tables.
No policy changes needed. Edge functions use service-role key (bypasses RLS).

## Notes
- All columns use IF NOT EXISTS for idempotency.
- Defaults match the previous hardcoded Shiprocket values (10/10/10/0.5).
- No data is lost; existing rows get sensible defaults.
*/

-- 1. products: shipping dimensions
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg numeric(8,3) DEFAULT 0.5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length_cm numeric(8,2) DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS width_cm numeric(8,2) DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height_cm numeric(8,2) DEFAULT 10;

-- 2. order_items: per-order preserved shipping dimensions
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS weight_kg numeric(8,3);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS length_cm numeric(8,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS width_cm numeric(8,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS height_cm numeric(8,2);

-- 3. orders: shipping calculation metadata
ALTER TABLE orders ADD COLUMN IF NOT EXISTS origin_pincode text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS destination_pincode text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_courier_id integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_courier_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_estimated_days integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_rate_id text;

-- 4. shipments: origin/destination pincode
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin_pincode text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS destination_pincode text;

-- Indexes for shipping-related lookups
CREATE INDEX IF NOT EXISTS idx_orders_destination_pincode ON orders(destination_pincode);
CREATE INDEX IF NOT EXISTS idx_shipments_shiprocket_order ON shipments(shiprocket_order_id);
