/*
# İkinciBazar Core Schema

Creates the complete normalized data architecture for the second-hand market
monitoring platform. This is a single-tenant private owner tool (no auth),
designed to scale to multi-user in the future without major structural changes.

## 1. New Tables

### categories
Product categories (gaming consoles, smart watches, etc.)
- id (uuid PK), name, slug (unique), icon, sort_order, created_at, updated_at

### products
Tracked product models within categories
- id (uuid PK), category_id (FK), name, brand, model, slug (unique),
  image_url, is_active, created_at, updated_at

### providers
Listing source platforms (Sahibinden, Letgo, Dolap)
- id (uuid PK), name, slug (unique), logo_url, website, is_enabled,
  created_at, updated_at

### sellers
Sellers on each provider platform
- id (uuid PK), provider_id (FK), external_id, display_name, member_since,
  listing_count, rating, phone_verified, email_verified, created_at, updated_at

### listings
Individual scraped product listings
- id (uuid PK), provider_id (FK), product_id (FK), external_listing_id,
  title, description, url, image_urls (jsonb array), price (numeric),
  currency, district, city, listing_date, first_seen_at, last_seen_at,
  condition, seller_id (FK), is_active, deleted_at (soft delete),
  created_at, updated_at

### favorites
Owner's saved listings with notes
- id (uuid PK), listing_id (FK), notes, created_at, updated_at

### alarms
Price alerts for tracked products
- id (uuid PK), product_id (FK), target_price, is_enabled,
  created_at, updated_at

### price_history
Every detected price change for listings
- id (uuid PK), listing_id (FK), price, detected_at, created_at, updated_at

### market_statistics
Aggregated market stats per product
- id (uuid PK), product_id (FK), average_price, median_price,
  minimum_price, maximum_price, listing_count, updated_at,
  created_at, updated_at

### ai_analysis
AI analysis results per listing
- id (uuid PK), listing_id (FK), opportunity_score, seller_score,
  image_score, description_score, negotiation_score, fake_probability,
  confidence, recommendation, explanation, analyzed_at,
  created_at, updated_at

## 2. Indexes
- categories: slug (unique)
- products: slug (unique), category_id, is_active
- providers: slug (unique), is_enabled
- sellers: provider_id, (provider_id, external_id) unique
- listings: provider_id, product_id, seller_id, city, condition, is_active,
  deleted_at, listing_date, price, last_seen_at
- favorites: listing_id
- alarms: product_id, is_enabled
- price_history: listing_id, detected_at
- market_statistics: product_id (unique)
- ai_analysis: listing_id (unique), opportunity_score

## 3. Security (RLS)
All tables have RLS enabled. Since this is a private single-tenant app
with NO authentication, all policies use `TO anon, authenticated` with
`USING (true)` / `WITH CHECK (true)` — the data is intentionally shared.
When multi-user is added in the future, add `owner_id` columns and
replace these policies with ownership-scoped checks.

## 4. Notes
- All PKs are UUID with DEFAULT gen_random_uuid()
- created_at and updated_at on every table
- Soft delete via deleted_at on listings
- updated_at auto-updated via trigger
- Unique constraints on (provider_id, external_id) for sellers
  and (provider_id, external_listing_id) for listings to prevent duplicates
- JSONB used for image_urls array
*/

-- ============================================================================
-- CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'Tag',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- PRODUCTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- PROVIDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  website text,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_providers_is_enabled ON providers(is_enabled);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_providers" ON providers;
CREATE POLICY "anon_select_providers" ON providers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_providers" ON providers;
CREATE POLICY "anon_insert_providers" ON providers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_providers" ON providers;
CREATE POLICY "anon_update_providers" ON providers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_providers" ON providers;
CREATE POLICY "anon_delete_providers" ON providers FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- SELLERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  display_name text NOT NULL,
  member_since integer,
  listing_count integer NOT NULL DEFAULT 0,
  rating numeric(3,1) NOT NULL DEFAULT 0,
  phone_verified boolean NOT NULL DEFAULT false,
  email_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_sellers_provider_id ON sellers(provider_id);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sellers" ON sellers;
CREATE POLICY "anon_select_sellers" ON sellers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sellers" ON sellers;
CREATE POLICY "anon_insert_sellers" ON sellers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sellers" ON sellers;
CREATE POLICY "anon_update_sellers" ON sellers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sellers" ON sellers;
CREATE POLICY "anon_delete_sellers" ON sellers FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- LISTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  external_listing_id text NOT NULL,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  price numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'TRY',
  district text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT 'Istanbul',
  listing_date timestamptz,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  condition text NOT NULL DEFAULT 'used',
  seller_id uuid REFERENCES sellers(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, external_listing_id)
);

CREATE INDEX IF NOT EXISTS idx_listings_provider_id ON listings(provider_id);
CREATE INDEX IF NOT EXISTS idx_listings_product_id ON listings(product_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_condition ON listings(condition);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_deleted_at ON listings(deleted_at);
CREATE INDEX IF NOT EXISTS idx_listings_listing_date ON listings(listing_date);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_last_seen_at ON listings(last_seen_at);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_listings" ON listings;
CREATE POLICY "anon_select_listings" ON listings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_listings" ON listings;
CREATE POLICY "anon_insert_listings" ON listings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_listings" ON listings;
CREATE POLICY "anon_update_listings" ON listings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_listings" ON listings;
CREATE POLICY "anon_delete_listings" ON listings FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- FAVORITES
-- ============================================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_favorites" ON favorites;
CREATE POLICY "anon_select_favorites" ON favorites FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
CREATE POLICY "anon_insert_favorites" ON favorites FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_favorites" ON favorites;
CREATE POLICY "anon_update_favorites" ON favorites FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;
CREATE POLICY "anon_delete_favorites" ON favorites FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- ALARMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS alarms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_price numeric(12,2) NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alarms_product_id ON alarms(product_id);
CREATE INDEX IF NOT EXISTS idx_alarms_is_enabled ON alarms(is_enabled);

ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alarms" ON alarms;
CREATE POLICY "anon_select_alarms" ON alarms FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alarms" ON alarms;
CREATE POLICY "anon_insert_alarms" ON alarms FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alarms" ON alarms;
CREATE POLICY "anon_update_alarms" ON alarms FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alarms" ON alarms;
CREATE POLICY "anon_delete_alarms" ON alarms FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- PRICE_HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price numeric(12,2) NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_listing_id ON price_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_price_history_detected_at ON price_history(detected_at);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_price_history" ON price_history;
CREATE POLICY "anon_select_price_history" ON price_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_price_history" ON price_history;
CREATE POLICY "anon_insert_price_history" ON price_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_price_history" ON price_history;
CREATE POLICY "anon_update_price_history" ON price_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_price_history" ON price_history;
CREATE POLICY "anon_delete_price_history" ON price_history FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- MARKET_STATISTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS market_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  average_price numeric(12,2) NOT NULL DEFAULT 0,
  median_price numeric(12,2) NOT NULL DEFAULT 0,
  minimum_price numeric(12,2) NOT NULL DEFAULT 0,
  maximum_price numeric(12,2) NOT NULL DEFAULT 0,
  listing_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at_row timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id)
);

CREATE INDEX IF NOT EXISTS idx_market_statistics_product_id ON market_statistics(product_id);

ALTER TABLE market_statistics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_market_statistics" ON market_statistics;
CREATE POLICY "anon_select_market_statistics" ON market_statistics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_market_statistics" ON market_statistics;
CREATE POLICY "anon_insert_market_statistics" ON market_statistics FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_market_statistics" ON market_statistics;
CREATE POLICY "anon_update_market_statistics" ON market_statistics FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_market_statistics" ON market_statistics;
CREATE POLICY "anon_delete_market_statistics" ON market_statistics FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- AI_ANALYSIS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  opportunity_score integer NOT NULL DEFAULT 0,
  seller_score integer NOT NULL DEFAULT 0,
  image_score integer NOT NULL DEFAULT 0,
  description_score integer NOT NULL DEFAULT 0,
  negotiation_score integer NOT NULL DEFAULT 0,
  fake_probability integer NOT NULL DEFAULT 0,
  confidence integer NOT NULL DEFAULT 0,
  recommendation text NOT NULL DEFAULT 'wait',
  explanation text,
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_listing_id ON ai_analysis(listing_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_opportunity_score ON ai_analysis(opportunity_score);

ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ai_analysis" ON ai_analysis;
CREATE POLICY "anon_select_ai_analysis" ON ai_analysis FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ai_analysis" ON ai_analysis;
CREATE POLICY "anon_insert_ai_analysis" ON ai_analysis FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ai_analysis" ON ai_analysis;
CREATE POLICY "anon_update_ai_analysis" ON ai_analysis FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ai_analysis" ON ai_analysis;
CREATE POLICY "anon_delete_ai_analysis" ON ai_analysis FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================================
-- AUTO-UPDATE TRIGGER for updated_at on all tables
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'categories','products','providers','sellers','listings',
      'favorites','alarms','price_history','market_statistics','ai_analysis'
    ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I;
       CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl
    );
  END LOOP;
END $$;
