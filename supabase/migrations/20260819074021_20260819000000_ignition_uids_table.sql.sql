/*
# IGNITION 2K26 — Kit UID Management Table

## Purpose
Stores ONLY the unique kit UIDs for the IGNITION 2K26 electronics competition.
Participant registration data (name, email, project, etc.) is NOT stored here —
it goes to Google Sheets via a secure backend. This table only tracks UID
existence and registration status.

## New Table: ignition_uids
- `id` (bigint, primary key, auto-increment)
- `uid` (text, unique, not null) — 12-char UID starting with "MT" + 10 random alphanumeric chars
- `status` (text, not null, default 'available') — 'available' or 'registered'
- `created_at` (timestamptz, default now())
- `registered_at` (timestamptz, nullable) — set when a participant registers with this UID

## Security (RLS)
- RLS enabled on `ignition_uids`.
- Public (anon + authenticated) can SELECT and UPDATE uid status (needed for
  UID verification by participants and status update after registration).
- Only authenticated admin users can INSERT new UIDs (admin generates them).
- No DELETE policy — UIDs should never be deleted from the frontend.

## Indexes
- Unique index on `uid` for fast lookups and uniqueness enforcement.
- Index on `status` for admin dashboard filtering.
*/

CREATE TABLE IF NOT EXISTS ignition_uids (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  uid text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  registered_at timestamptz
);

ALTER TABLE ignition_uids ENABLE ROW LEVEL SECURITY;

-- Public can read UIDs (needed for verification)
DROP POLICY IF EXISTS "public_select_ignition_uids" ON ignition_uids;
CREATE POLICY "public_select_ignition_uids"
ON ignition_uids FOR SELECT
TO anon, authenticated USING (true);

-- Authenticated (admin) can insert new UIDs
DROP POLICY IF EXISTS "admin_insert_ignition_uids" ON ignition_uids;
CREATE POLICY "admin_insert_ignition_uids"
ON ignition_uids FOR INSERT
TO authenticated WITH CHECK (true);

-- Public can update UID status (verification + registration marking)
DROP POLICY IF EXISTS "public_update_ignition_uids" ON ignition_uids;
CREATE POLICY "public_update_ignition_uids"
ON ignition_uids FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

-- Index for status filtering on admin dashboard
CREATE INDEX IF NOT EXISTS idx_ignition_uids_status ON ignition_uids(status);
