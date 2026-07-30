/*
# Provider Sync Infrastructure

Creates tables for the real provider data collection system.

## 1. New Tables

### sync_runs
Tracks each sync cycle across all providers.
- id, status (running/success/partial/error), interval_minutes,
  started_at, finished_at, total_found/imported/updated/failed,
  error_summary

### sync_logs
Per-provider log within a sync run. One row per provider per run.
- id, sync_run_id (FK), provider_id (FK), status, started_at, finished_at,
  duration_ms, found/imported/updated/failed counts, error_message, avg_response_ms
- Unique on (sync_run_id, provider_id)

### provider_status
Denormalized dashboard view — one row per provider, updated after each sync.
- id, provider_id (FK unique), status, last_sync_at, last_sync_duration_ms,
  total_listings_imported, total_errors, avg_response_ms, interval_minutes, is_active

## 2. Security
RLS enabled, single-tenant anon+authenticated open policies (no auth app).
*/

-- ============================================================================
-- SYNC_RUNS
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'running',
  interval_minutes integer NOT NULL DEFAULT 10,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  total_found integer NOT NULL DEFAULT 0,
  total_imported integer NOT NULL DEFAULT 0,
  total_updated integer NOT NULL DEFAULT 0,
  total_failed integer NOT NULL DEFAULT 0,
  error_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_status ON sync_runs(status);
CREATE INDEX IF NOT EXISTS idx_sync_runs_started_at ON sync_runs(started_at);

ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sync_runs" ON sync_runs;
CREATE POLICY "anon_select_sync_runs" ON sync_runs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sync_runs" ON sync_runs;
CREATE POLICY "anon_insert_sync_runs" ON sync_runs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sync_runs" ON sync_runs;
CREATE POLICY "anon_update_sync_runs" ON sync_runs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sync_runs" ON sync_runs;
CREATE POLICY "anon_delete_sync_runs" ON sync_runs FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- SYNC_LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_run_id uuid NOT NULL REFERENCES sync_runs(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'running',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  duration_ms integer,
  found_count integer NOT NULL DEFAULT 0,
  imported_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  error_message text,
  avg_response_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sync_run_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_sync_run_id ON sync_logs(sync_run_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_provider_id ON sync_logs(provider_id);

ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sync_logs" ON sync_logs;
CREATE POLICY "anon_select_sync_logs" ON sync_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sync_logs" ON sync_logs;
CREATE POLICY "anon_insert_sync_logs" ON sync_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sync_logs" ON sync_logs;
CREATE POLICY "anon_update_sync_logs" ON sync_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sync_logs" ON sync_logs;
CREATE POLICY "anon_delete_sync_logs" ON sync_logs FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- PROVIDER_STATUS
-- ============================================================================
CREATE TABLE IF NOT EXISTS provider_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL UNIQUE REFERENCES providers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'idle',
  last_sync_at timestamptz,
  last_sync_duration_ms integer,
  total_listings_imported integer NOT NULL DEFAULT 0,
  total_errors integer NOT NULL DEFAULT 0,
  avg_response_ms integer,
  interval_minutes integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_status_provider_id ON provider_status(provider_id);

ALTER TABLE provider_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_provider_status" ON provider_status;
CREATE POLICY "anon_select_provider_status" ON provider_status FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_provider_status" ON provider_status;
CREATE POLICY "anon_insert_provider_status" ON provider_status FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_provider_status" ON provider_status;
CREATE POLICY "anon_update_provider_status" ON provider_status FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_provider_status" ON provider_status;
CREATE POLICY "anon_delete_provider_status" ON provider_status FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- AUTO-UPDATE TRIGGER for new tables
-- ============================================================================
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['sync_runs','sync_logs','provider_status'])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I;
       CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl
    );
  END LOOP;
END $$;
