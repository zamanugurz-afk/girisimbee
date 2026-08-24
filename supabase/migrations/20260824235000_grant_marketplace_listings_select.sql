-- Grant table-level SELECT and REFERENCES on public.marketplace_listings to authenticated and anon.
-- Fixes error 42501 (permission denied for table marketplace_listings) during foreign-key checks and queries.

GRANT SELECT, REFERENCES ON TABLE public.marketplace_listings TO authenticated;
GRANT SELECT, REFERENCES ON TABLE public.marketplace_listings TO anon;

GRANT SELECT, INSERT, UPDATE ON TABLE public.marketplace_listing_contact_requests TO authenticated;
GRANT ALL ON TABLE public.marketplace_listing_contact_requests TO service_role;

-- Maintain column lockdowns (contact_phone, owner_id)
REVOKE SELECT (contact_phone) ON TABLE public.marketplace_listings FROM anon;
REVOKE SELECT (contact_phone) ON TABLE public.marketplace_listings FROM authenticated;

REVOKE SELECT (owner_id) ON TABLE public.marketplace_listings FROM anon;
REVOKE SELECT (owner_id) ON TABLE public.marketplace_listings FROM authenticated;

GRANT SELECT (owner_id) ON TABLE public.marketplace_listings TO service_role;