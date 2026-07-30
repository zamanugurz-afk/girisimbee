-- Extend marketplace companies + members + company follows

ALTER TABLE public.marketplace_companies
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS website_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_companies_slug_lower_unique
  ON public.marketplace_companies (lower(slug))
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.marketplace_company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.marketplace_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_company_members_unique UNIQUE (company_id, user_id)
);

CREATE INDEX IF NOT EXISTS marketplace_company_members_company_idx
  ON public.marketplace_company_members (company_id);

CREATE INDEX IF NOT EXISTS marketplace_company_members_user_idx
  ON public.marketplace_company_members (user_id);

CREATE TABLE IF NOT EXISTS public.marketplace_company_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.marketplace_companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_company_follows_unique UNIQUE (follower_id, company_id)
);

CREATE INDEX IF NOT EXISTS marketplace_company_follows_company_idx
  ON public.marketplace_company_follows (company_id);

ALTER TABLE public.marketplace_company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_company_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketplace_company_members_public_read"
  ON public.marketplace_company_members FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "marketplace_company_members_owner_manage"
  ON public.marketplace_company_members FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.marketplace_companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "marketplace_company_members_self_leave"
  ON public.marketplace_company_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND role <> 'owner');

CREATE POLICY "marketplace_company_follows_public_read"
  ON public.marketplace_company_follows FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "marketplace_company_follows_authenticated_insert"
  ON public.marketplace_company_follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "marketplace_company_follows_owner_delete"
  ON public.marketplace_company_follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-media',
  'company-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "company_media_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'company-media');

CREATE POLICY "company_media_owner_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'company-media');

CREATE POLICY "company_media_owner_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'company-media');

CREATE POLICY "company_media_owner_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'company-media');
