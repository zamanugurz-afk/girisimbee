-- Extend marketplace profiles + follow system + profile media storage

ALTER TABLE public.marketplace_profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_visible BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_visible BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS website_visible BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_profiles_username_unique
  ON public.marketplace_profiles (lower(username))
  WHERE deleted_at IS NULL AND username IS NOT NULL;

CREATE INDEX IF NOT EXISTS marketplace_profiles_username_idx
  ON public.marketplace_profiles (username)
  WHERE deleted_at IS NULL AND username IS NOT NULL;

-- Follow relationships between users
CREATE TABLE IF NOT EXISTS public.marketplace_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_follows_no_self_follow CHECK (follower_id <> following_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_follows_pair_unique
  ON public.marketplace_follows (follower_id, following_id);

CREATE INDEX IF NOT EXISTS marketplace_follows_follower_idx
  ON public.marketplace_follows (follower_id);

CREATE INDEX IF NOT EXISTS marketplace_follows_following_idx
  ON public.marketplace_follows (following_id);

ALTER TABLE public.marketplace_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketplace_follows_public_read"
  ON public.marketplace_follows FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "marketplace_follows_authenticated_insert"
  ON public.marketplace_follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "marketplace_follows_owner_delete"
  ON public.marketplace_follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- Profile media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-media',
  'profile-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "profile_media_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'profile-media');

CREATE POLICY "profile_media_owner_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_media_owner_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_media_owner_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
