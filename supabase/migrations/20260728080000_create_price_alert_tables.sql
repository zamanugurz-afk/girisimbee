-- Grouped product price alerts and triggered notifications.

CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id text NOT NULL,
  label text,
  max_price numeric(12,2) NOT NULL,
  min_deal_score numeric(5,2) NOT NULL DEFAULT 0,
  min_trust_score numeric(5,2) NOT NULL DEFAULT 0,
  notify_once boolean NOT NULL DEFAULT true,
  notify_again_after_days integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  last_matched_listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  trigger_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_group_id ON price_alerts(group_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_is_active ON price_alerts(is_active);

CREATE TABLE IF NOT EXISTS price_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES price_alerts(id) ON DELETE CASCADE,
  group_id text NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  matched_price numeric(12,2) NOT NULL,
  matched_deal_score numeric(5,2) NOT NULL,
  matched_trust_score numeric(5,2) NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_notifications_alert_id ON price_notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_price_notifications_group_id ON price_notifications(group_id);
CREATE INDEX IF NOT EXISTS idx_price_notifications_created_at ON price_notifications(created_at DESC);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_price_alerts" ON price_alerts;
CREATE POLICY "anon_select_price_alerts" ON price_alerts
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_price_alerts" ON price_alerts;
CREATE POLICY "anon_insert_price_alerts" ON price_alerts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_price_alerts" ON price_alerts;
CREATE POLICY "anon_update_price_alerts" ON price_alerts
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_price_alerts" ON price_alerts;
CREATE POLICY "anon_delete_price_alerts" ON price_alerts
  FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_price_notifications" ON price_notifications;
CREATE POLICY "anon_select_price_notifications" ON price_notifications
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_price_notifications" ON price_notifications;
CREATE POLICY "anon_insert_price_notifications" ON price_notifications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_price_notifications" ON price_notifications;
CREATE POLICY "anon_update_price_notifications" ON price_notifications
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_price_notifications" ON price_notifications;
CREATE POLICY "anon_delete_price_notifications" ON price_notifications
  FOR DELETE TO anon, authenticated USING (true);
