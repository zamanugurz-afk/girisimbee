-- Seed business transfer category and listing types with deterministic UUIDs

INSERT INTO public.marketplace_categories (
  id, slug, name, description, accent_color, icon, sort_order, status, module_key
)
VALUES (
  'c1000001-0001-4000-8000-000000000009',
  'isletme-devri',
  'İşletme Devri',
  'İşletmenizi devredin veya hazır işletme devralın',
  '#F59E0B',
  'Building2',
  9,
  'active',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  accent_color = EXCLUDED.accent_color,
  status = EXCLUDED.status;

INSERT INTO public.marketplace_listing_types (
  id, category_id, slug, name, description, field_schema, sort_order, status
)
VALUES
  (
    'a0000009-0001-4000-8000-000000000009',
    'c1000001-0001-4000-8000-000000000009',
    'isletme-devret',
    'İşletmemi Devrediyorum',
    'Faaliyetteki veya kurulu işletmenizi devredin',
    '{}',
    1,
    'active'
  ),
  (
    'a0000010-0001-4000-8000-000000000010',
    'c1000001-0001-4000-8000-000000000009',
    'isletme-devral',
    'İşletme Devralmak İstiyorum',
    'Devralmak istediğiniz sektör ve işletme kriterleri',
    '{}',
    2,
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  status = EXCLUDED.status;
