-- Disable Sahibinden until residential proxy / anti-bot infra is available.
UPDATE providers
SET is_enabled = false, updated_at = now()
WHERE slug = 'sahibinden';

-- Deactivate any remaining Sahibinden listings so they never appear in the UI.
UPDATE listings
SET is_active = false, deleted_at = now(), updated_at = now()
WHERE provider_id IN (SELECT id FROM providers WHERE slug = 'sahibinden');
