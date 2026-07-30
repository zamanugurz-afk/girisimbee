-- Seed the three supported marketplace providers
INSERT INTO providers (name, slug, logo_url, website, is_enabled)
VALUES
  ('Sahibinden', 'sahibinden', NULL, 'https://www.sahibinden.com', true),
  ('Letgo', 'letgo', NULL, 'https://www.letgo.com', true),
  ('Dolap', 'dolap', NULL, 'https://www.dolap.com', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  website = EXCLUDED.website,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();
