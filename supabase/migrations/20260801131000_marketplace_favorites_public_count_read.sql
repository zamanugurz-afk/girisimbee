-- Allow aggregate favorite counts for marketplace browse sort (most_favorited).
-- Existing owner policy remains for writes; this adds public SELECT on active rows.

DROP POLICY IF EXISTS "marketplace_favorites_public_count_read" ON public.marketplace_favorites;

CREATE POLICY "marketplace_favorites_public_count_read"
  ON public.marketplace_favorites
  FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL AND status = 'active');
