/*
# Create intern_certificates table

1. New Tables
- `intern_certificates` — stores MICCROTEN internship certificates issued to interns.
  - `id` (uuid, primary key)
  - `certificate_number` (text, unique, not null) — public-facing ID used for verification
  - `intern_name` (text, not null)
  - `photo_url` (text, nullable) — intern photo image URL
  - `role` (text, nullable) — intern role/title
  - `project` (text, nullable) — project worked on
  - `department` (text, nullable) — department
  - `university` (text, nullable) — university/college
  - `start_date` (date, nullable) — internship start date
  - `end_date` (date, nullable) — internship end date
  - `certificate_issue_date` (date, nullable) — date certificate was issued
  - `certificate_url` (text, nullable) — URL to the certificate document
  - `certificate_image_url` (text, nullable) — URL to a preview image of the certificate
  - `status` (text, not null, default 'active') — active | revoked | expired
  - `remarks` (text, nullable) — admin remarks
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

2. Security
- Enable RLS on `intern_certificates`.
- Public (anon + authenticated) can SELECT so the public verification page works without login.
- Only authenticated admin users can INSERT / UPDATE / DELETE (admin panel is behind auth).
- No user_id column — certificates are operator-managed records, not per-user owned data.

3. Indexes
- Unique index on `certificate_number` for fast verification lookups.
- Index on `created_at` for admin sorting.

4. Notes
- The public verification page reads by `certificate_number`; the unique index guarantees one result.
- Admin writes are scoped to `authenticated` because the admin panel requires sign-in.
*/

CREATE TABLE IF NOT EXISTS intern_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text UNIQUE NOT NULL,
  intern_name text NOT NULL,
  photo_url text,
  role text,
  project text,
  department text,
  university text,
  start_date date,
  end_date date,
  certificate_issue_date date,
  certificate_url text,
  certificate_image_url text,
  status text NOT NULL DEFAULT 'active',
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE intern_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_intern_certificates" ON intern_certificates;
CREATE POLICY "public_select_intern_certificates"
ON intern_certificates FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_intern_certificates" ON intern_certificates;
CREATE POLICY "admin_insert_intern_certificates"
ON intern_certificates FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_intern_certificates" ON intern_certificates;
CREATE POLICY "admin_update_intern_certificates"
ON intern_certificates FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_intern_certificates" ON intern_certificates;
CREATE POLICY "admin_delete_intern_certificates"
ON intern_certificates FOR DELETE
TO authenticated USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS intern_certificates_certificate_number_key
ON intern_certificates (certificate_number);

CREATE INDEX IF NOT EXISTS intern_certificates_created_at_idx
ON intern_certificates (created_at DESC);
