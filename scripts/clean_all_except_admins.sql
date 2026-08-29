-- =========================================================================
-- GİRİŞİMBEE — VERİTABANI TAM TEMİZLİK VE SIFIRLAMA SCRIPTI
-- =========================================================================
-- 1. TÜM İLANLARI SİLER.
-- 2. TÜM MESAJLAŞMALARI SİLER.
-- 3. ugurzaman1907@gmail.com VE zamanugurz@gmail.com DIŞINDAKİ TÜM KULLANICILARI VE PROFİLLERİ SİLER.
-- =========================================================================

BEGIN;

-- 1. İLANLAR VE TÜM İLİŞKİLİ VERİLER
DELETE FROM public.marketplace_applications WHERE true;
DELETE FROM public.ad_inquiries WHERE true;
DELETE FROM public.contact_requests WHERE true;
DELETE FROM public.listing_favorites WHERE true;
DELETE FROM public.favorites WHERE true;
DELETE FROM public.saved_searches WHERE true;
DELETE FROM public.listing_views WHERE true;
DELETE FROM public.listing_media WHERE true;
DELETE FROM public.listing_packages WHERE true;
DELETE FROM public.listing_tags WHERE true;
DELETE FROM public.ecosystem_matches WHERE true;
DELETE FROM public.matches WHERE true;
DELETE FROM public.reports WHERE true;
DELETE FROM public.marketplace_listings WHERE true;
DELETE FROM public.listings WHERE true;

-- 2. MESAJLAŞMALAR VE BİLDİRİMLER
DELETE FROM public.messages WHERE true;
DELETE FROM public.direct_messages WHERE true;
DELETE FROM public.chat_messages WHERE true;
DELETE FROM public.conversation_participants WHERE true;
DELETE FROM public.conversations WHERE true;
DELETE FROM public.notifications WHERE true;

-- 3. ugurzaman1907@gmail.com VE zamanugurz@gmail.com HARİÇ TÜM PROFİLLER VE KULLANICILAR
DO $DO
DECLARE
    keep_emails text[] := ARRAY['ugurzaman1907@gmail.com', 'zamanugurz@gmail.com'];
    keep_ids uuid[];
BEGIN
    SELECT COALESCE(ARRAY_AGG(id), ARRAY[]::uuid[]) INTO keep_ids 
    FROM auth.users 
    WHERE lower(email) = ANY(keep_emails);

    -- Modül Profilleri
    DELETE FROM public.candidate_profiles WHERE id IS NOT NULL AND NOT (id = ANY(keep_ids));
    DELETE FROM public.employer_profiles WHERE id IS NOT NULL AND NOT (id = ANY(keep_ids));
    DELETE FROM public.franchise_profiles WHERE id IS NOT NULL AND NOT (id = ANY(keep_ids));
    DELETE FROM public.investor_profiles WHERE id IS NOT NULL AND NOT (id = ANY(keep_ids));
    DELETE FROM public.company_profiles WHERE user_id IS NOT NULL AND NOT (user_id = ANY(keep_ids));
    DELETE FROM public.user_settings WHERE user_id IS NOT NULL AND NOT (user_id = ANY(keep_ids));
    
    -- Ana Profiller
    DELETE FROM public.profiles WHERE id IS NOT NULL AND NOT (id = ANY(keep_ids));

    -- Auth Kullanıcıları
    DELETE FROM auth.users WHERE lower(email) IS NOT NULL AND NOT (lower(email) = ANY(keep_emails));
END $DO;

COMMIT;
