-- Align legacy app category/listing-type UUIDs with seeded marketplace values.
-- Safe no-op when IDs already match (ON CONFLICT DO NOTHING / conditional updates).

-- Categories: remap e1000001-* → c1000001-* if legacy rows exist
UPDATE marketplace_categories
SET id = 'c1000001-0001-4000-8000-000000000001'::uuid
WHERE id = 'e1000001-0001-4000-8000-000000000001'::uuid
  AND NOT EXISTS (SELECT 1 FROM marketplace_categories WHERE id = 'c1000001-0001-4000-8000-000000000001'::uuid);

UPDATE marketplace_categories
SET id = 'c1000001-0001-4000-8000-000000000002'::uuid
WHERE id = 'e1000001-0001-4000-8000-000000000002'::uuid
  AND NOT EXISTS (SELECT 1 FROM marketplace_categories WHERE id = 'c1000001-0001-4000-8000-000000000002'::uuid);

UPDATE marketplace_categories
SET id = 'c1000001-0001-4000-8000-000000000003'::uuid
WHERE id = 'e1000001-0001-4000-8000-000000000003'::uuid
  AND NOT EXISTS (SELECT 1 FROM marketplace_categories WHERE id = 'c1000001-0001-4000-8000-000000000003'::uuid);

UPDATE marketplace_categories
SET id = 'c1000001-0001-4000-8000-000000000004'::uuid
WHERE id = 'e1000001-0001-4000-8000-000000000004'::uuid
  AND NOT EXISTS (SELECT 1 FROM marketplace_categories WHERE id = 'c1000001-0001-4000-8000-000000000004'::uuid);

UPDATE marketplace_categories
SET id = 'c1000001-0001-4000-8000-000000000005'::uuid
WHERE id = 'e1000001-0001-4000-8000-000000000005'::uuid
  AND NOT EXISTS (SELECT 1 FROM marketplace_categories WHERE id = 'c1000001-0001-4000-8000-000000000005'::uuid);

-- Listing types: remap e1000001-* → lt000001-* if legacy rows exist
UPDATE marketplace_listing_types
SET id = 'lt000001-0001-4000-8000-000000000001'::uuid,
    category_id = 'c1000001-0001-4000-8000-000000000001'::uuid
WHERE id = 'e1000001-0001-4000-8000-000000000001'::uuid;

UPDATE marketplace_listing_types
SET id = 'lt000001-0001-4000-8000-000000000002'::uuid,
    category_id = 'c1000001-0001-4000-8000-000000000002'::uuid,
    slug = 'yatirim-yapiyorum'
WHERE id = 'e1000001-0001-4000-8000-000000000002'::uuid;

UPDATE marketplace_listing_types
SET id = 'lt000001-0001-4000-8000-000000000003'::uuid,
    category_id = 'c1000001-0001-4000-8000-000000000003'::uuid
WHERE id = 'e1000001-0001-4000-8000-000000000003'::uuid;

UPDATE marketplace_listing_types
SET id = 'lt000001-0001-4000-8000-000000000004'::uuid,
    category_id = 'c1000001-0001-4000-8000-000000000004'::uuid
WHERE id = 'e1000001-0001-4000-8000-000000000004'::uuid;

UPDATE marketplace_listing_types
SET id = 'lt000001-0001-4000-8000-000000000005'::uuid,
    category_id = 'c1000001-0001-4000-8000-000000000005'::uuid
WHERE id = 'e1000001-0001-4000-8000-000000000005'::uuid;

-- Fix orphaned listings pointing at legacy category IDs
UPDATE marketplace_listings
SET category_id = 'c1000001-0001-4000-8000-000000000001'::uuid
WHERE category_id = 'e1000001-0001-4000-8000-000000000001'::uuid;

UPDATE marketplace_listings
SET category_id = 'c1000001-0001-4000-8000-000000000002'::uuid
WHERE category_id = 'e1000001-0001-4000-8000-000000000002'::uuid;

UPDATE marketplace_listings
SET category_id = 'c1000001-0001-4000-8000-000000000003'::uuid
WHERE category_id = 'e1000001-0001-4000-8000-000000000003'::uuid;

UPDATE marketplace_listings
SET category_id = 'c1000001-0001-4000-8000-000000000004'::uuid
WHERE category_id = 'e1000001-0001-4000-8000-000000000004'::uuid;

UPDATE marketplace_listings
SET category_id = 'c1000001-0001-4000-8000-000000000005'::uuid
WHERE category_id = 'e1000001-0001-4000-8000-000000000005'::uuid;

UPDATE marketplace_listings
SET listing_type_id = 'lt000001-0001-4000-8000-000000000001'::uuid
WHERE listing_type_id = 'e1000001-0001-4000-8000-000000000001'::uuid;

UPDATE marketplace_listings
SET listing_type_id = 'lt000001-0001-4000-8000-000000000002'::uuid
WHERE listing_type_id = 'e1000001-0001-4000-8000-000000000002'::uuid;

UPDATE marketplace_listings
SET listing_type_id = 'lt000001-0001-4000-8000-000000000003'::uuid
WHERE listing_type_id = 'e1000001-0001-4000-8000-000000000003'::uuid;

UPDATE marketplace_listings
SET listing_type_id = 'lt000001-0001-4000-8000-000000000004'::uuid
WHERE listing_type_id = 'e1000001-0001-4000-8000-000000000004'::uuid;

UPDATE marketplace_listings
SET listing_type_id = 'lt000001-0001-4000-8000-000000000005'::uuid
WHERE listing_type_id = 'e1000001-0001-4000-8000-000000000005'::uuid;
