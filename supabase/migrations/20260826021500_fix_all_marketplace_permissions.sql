-- Fix Error 42501: permission denied for table marketplace_listings
-- Restores required SELECT and column-level privileges for authenticated and anon roles so RLS policies can evaluate.

-- 1. Table-level permissions on marketplace_listings
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON TABLE public.marketplace_listings TO authenticated;
GRANT SELECT, REFERENCES ON TABLE public.marketplace_listings TO anon;
GRANT ALL ON TABLE public.marketplace_listings TO service_role;

-- 2. Grant SELECT on all columns including owner_id (required by RLS auth.uid() = owner_id checks)
GRANT SELECT (owner_id) ON TABLE public.marketplace_listings TO authenticated;
GRANT SELECT (owner_id) ON TABLE public.marketplace_listings TO anon;
GRANT ALL (owner_id) ON TABLE public.marketplace_listings TO service_role;

-- 3. Related marketplace tables
GRANT ALL ON TABLE public.marketplace_listing_images TO authenticated;
GRANT ALL ON TABLE public.marketplace_listing_images TO anon;
GRANT ALL ON TABLE public.marketplace_listing_images TO service_role;

GRANT ALL ON TABLE public.marketplace_listing_tags TO authenticated;
GRANT ALL ON TABLE public.marketplace_listing_tags TO anon;
GRANT ALL ON TABLE public.marketplace_listing_tags TO service_role;

GRANT ALL ON TABLE public.marketplace_listing_activities TO authenticated;
GRANT ALL ON TABLE public.marketplace_listing_activities TO anon;
GRANT ALL ON TABLE public.marketplace_listing_activities TO service_role;

GRANT ALL ON TABLE public.marketplace_profile_modules TO authenticated;
GRANT ALL ON TABLE public.marketplace_profile_modules TO anon;
GRANT ALL ON TABLE public.marketplace_profile_modules TO service_role;

GRANT ALL ON TABLE public.founder_profiles TO authenticated;
GRANT ALL ON TABLE public.founder_profiles TO anon;
GRANT ALL ON TABLE public.founder_profiles TO service_role;

GRANT ALL ON TABLE public.marketplace_listing_contact_requests TO authenticated;
GRANT ALL ON TABLE public.marketplace_listing_contact_requests TO anon;
GRANT ALL ON TABLE public.marketplace_listing_contact_requests TO service_role;
