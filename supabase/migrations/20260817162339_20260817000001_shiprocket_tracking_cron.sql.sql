/*
# Automatic Shiprocket tracking sync via pg_cron

## Purpose
Sets up a scheduled job that runs every 30 minutes to call the
shiprocket-sync-tracking edge function, which fetches the latest
shipment statuses from Shiprocket and updates the shipments and
orders tables accordingly.

## Changes
1. Enables the pg_cron extension (Supabase's scheduled job runner).
2. Creates a SECURITY DEFINER function that calls the edge function
   via pg_net's http_post.
3. Schedules it to run every 30 minutes.

## Security
- The function runs as SECURITY DEFINER (postgres) so it can use
  pg_net to make outbound HTTP calls.
- The edge function uses the service role key internally.
- No new tables or RLS changes needed.

## Notes
- pg_cron and pg_net are Supabase-managed extensions.
- The job is idempotent — the edge function skips already-delivered
  shipments and deduplicates tracking events.
*/

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing function if re-running
DROP FUNCTION IF EXISTS public.sync_shiprocket_tracking();

CREATE OR REPLACE FUNCTION public.sync_shiprocket_tracking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_url text;
  service_key text;
  response int;
BEGIN
  project_url := current_setting('app.supabase_url', true);
  service_key := current_setting('app.supabase_service_role_key', true);

  IF project_url IS NULL OR service_key IS NULL THEN
    RAISE NOTICE 'Supabase URL or service key not configured';
    RETURN;
  END IF;

  SELECT net.http_post(
    url := project_url || '/functions/v1/shiprocket-sync-tracking',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := '{}'::jsonb
  ) INTO response;
END;
$$;

-- Schedule the job every 30 minutes
SELECT cron.schedule(
  'shiprocket-tracking-sync',
  '*/30 * * * *',
  $$SELECT public.sync_shiprocket_tracking();$$
);
