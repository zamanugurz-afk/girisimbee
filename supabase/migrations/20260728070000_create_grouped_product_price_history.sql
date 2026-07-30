-- Grouped product daily price snapshots (distinct from listing-level price_history).

CREATE TABLE IF NOT EXISTS grouped_product_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id text NOT NULL,
  snapshot_date date NOT NULL,
  lowest_price numeric(12,2) NOT NULL,
  average_price numeric(12,2) NOT NULL,
  highest_price numeric(12,2) NOT NULL,
  listing_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_grouped_product_price_history_group_id
  ON grouped_product_price_history(group_id);

CREATE INDEX IF NOT EXISTS idx_grouped_product_price_history_snapshot_date
  ON grouped_product_price_history(snapshot_date DESC);

ALTER TABLE grouped_product_price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_grouped_product_price_history" ON grouped_product_price_history;
CREATE POLICY "anon_select_grouped_product_price_history" ON grouped_product_price_history
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_grouped_product_price_history" ON grouped_product_price_history;
CREATE POLICY "anon_insert_grouped_product_price_history" ON grouped_product_price_history
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_grouped_product_price_history" ON grouped_product_price_history;
CREATE POLICY "anon_update_grouped_product_price_history" ON grouped_product_price_history
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_grouped_product_price_history" ON grouped_product_price_history;
CREATE POLICY "anon_delete_grouped_product_price_history" ON grouped_product_price_history
  FOR DELETE TO anon, authenticated USING (true);
