-- Seed supported comparison products (consoles + controllers only)
-- Deactivate legacy products (PS4, Switch, smart watches, etc.)

INSERT INTO categories (name, slug, icon, sort_order)
VALUES
  ('Gaming Consoles', 'gaming-consoles', 'Gamepad2', 1),
  ('Controllers', 'controllers', 'Gamepad', 2)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

UPDATE categories
SET sort_order = 99, updated_at = now()
WHERE slug = 'smart-watches';

INSERT INTO products (category_id, name, brand, model, slug, is_active)
SELECT c.id, v.name, v.brand, v.model, v.slug, true
FROM (VALUES
  ('gaming-consoles', 'PlayStation 5', 'Sony', 'PS5', 'playstation-5'),
  ('gaming-consoles', 'PlayStation 5 Slim', 'Sony', 'PS5 Slim', 'playstation-5-slim'),
  ('gaming-consoles', 'PlayStation 5 Pro', 'Sony', 'PS5 Pro', 'playstation-5-pro'),
  ('gaming-consoles', 'Xbox Series X', 'Microsoft', 'Series X', 'xbox-series-x'),
  ('gaming-consoles', 'Xbox Series S', 'Microsoft', 'Series S', 'xbox-series-s'),
  ('controllers', 'Sony DualSense', 'Sony', 'DualSense', 'dualsense'),
  ('controllers', 'Sony DualSense Edge', 'Sony', 'DualSense Edge', 'dualsense-edge'),
  ('controllers', 'Xbox Wireless Controller (Series)', 'Microsoft', 'Wireless Controller', 'xbox-wireless-controller'),
  ('controllers', 'Xbox Elite Wireless Controller Series 2', 'Microsoft', 'Elite Series 2', 'xbox-elite-series-2')
) AS v(category_slug, name, brand, model, slug)
JOIN categories c ON c.slug = v.category_slug
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  is_active = true,
  updated_at = now();

UPDATE products
SET is_active = false, updated_at = now()
WHERE slug NOT IN (
  'playstation-5',
  'playstation-5-slim',
  'playstation-5-pro',
  'xbox-series-x',
  'xbox-series-s',
  'dualsense',
  'dualsense-edge',
  'xbox-wireless-controller',
  'xbox-elite-series-2'
);
