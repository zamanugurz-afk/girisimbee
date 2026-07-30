-- Trust & verification: investor flag, document storage, owner update policy

ALTER TABLE public.marketplace_profiles
  ADD COLUMN IF NOT EXISTS investor_verified BOOLEAN NOT NULL DEFAULT false;

-- Owner can update own verification rows (document submission)
CREATE POLICY IF NOT EXISTS marketplace_verifications_owner_update
  ON public.marketplace_verifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Private verification documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-media',
  'verification-media',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS verification_media_owner_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'verification-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY IF NOT EXISTS verification_media_owner_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'verification-media'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

CREATE POLICY IF NOT EXISTS verification_media_owner_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'verification-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY IF NOT EXISTS verification_media_admin_all
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'verification-media' AND public.is_admin())
  WITH CHECK (bucket_id = 'verification-media' AND public.is_admin());
