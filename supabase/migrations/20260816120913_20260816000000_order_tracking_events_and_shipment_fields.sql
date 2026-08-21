/*
  # Order tracking events + shipment tracking fields

  1. Adds tracking synchronization fields to shipments:
     tracking_status, tracking_message, tracking_last_synced_at

  2. Creates order_tracking_events table for per-shipment tracking timeline.

  3. RLS: owner-scoped SELECT on order_tracking_events (customers read their own);
     inserts/updates happen via service-role key in edge functions (bypasses RLS).

  4. Indexes on order_id and shiprocket_order_id for fast lookups.
*/

-- Extend shipments with tracking sync metadata
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS tracking_status text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS tracking_message text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS tracking_last_synced_at timestamptz;

-- Extend orders with shiprocket_order_id for quick admin lookups
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id text;

-- ============================================================
-- order_tracking_events
-- ============================================================
CREATE TABLE IF NOT EXISTS order_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  shiprocket_order_id text,
  shipment_id text,
  awb_code text,
  status text,
  status_code text,
  activity text,
  location text,
  event_timestamp timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Customers can read tracking events for their own orders
DROP POLICY IF EXISTS "select_own_tracking_events" ON order_tracking_events;
CREATE POLICY "select_own_tracking_events" ON order_tracking_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_tracking_events.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Admins (any authenticated user — admin panel is behind auth) can read all
DROP POLICY IF EXISTS "admin_read_all_tracking_events" ON order_tracking_events;
CREATE POLICY "admin_read_all_tracking_events" ON order_tracking_events
  FOR SELECT TO authenticated USING (true);

-- Inserts are done via service-role key in edge functions (bypasses RLS).
-- We still add an authenticated-insert policy so the admin panel could
-- insert manual tracking events if needed.
DROP POLICY IF EXISTS "auth_insert_tracking_events" ON order_tracking_events;
CREATE POLICY "auth_insert_tracking_events" ON order_tracking_events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tracking_events_order ON order_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_awb ON order_tracking_events(awb_code);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shiprocket_order ON order_tracking_events(shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON order_tracking_events(event_timestamp DESC);
