-- Reconcile marketplace_activities, marketplace_tags, and marketplace_listing_tags
-- with application expectations (migrations 20260729010000 + 20260729020000).

-- ── marketplace_tags ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  usage_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_tags_slug_unique
  ON public.marketplace_tags (slug) WHERE deleted_at IS NULL;

ALTER TABLE public.marketplace_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_tags_public_read" ON public.marketplace_tags;
CREATE POLICY "marketplace_tags_public_read"
  ON public.marketplace_tags FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "marketplace_tags_authenticated_insert" ON public.marketplace_tags;
CREATE POLICY "marketplace_tags_authenticated_insert"
  ON public.marketplace_tags FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── marketplace_listing_tags ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_listing_tags (
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (listing_id, tag_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_listing_tags_tag_id_fkey'
  ) THEN
    ALTER TABLE public.marketplace_listing_tags
      ADD CONSTRAINT marketplace_listing_tags_tag_id_fkey
      FOREIGN KEY (tag_id) REFERENCES public.marketplace_tags(id)
      ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.marketplace_listing_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_listing_tags_public_read" ON public.marketplace_listing_tags;
CREATE POLICY "marketplace_listing_tags_public_read"
  ON public.marketplace_listing_tags FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "marketplace_listing_tags_owner_write" ON public.marketplace_listing_tags;
CREATE POLICY "marketplace_listing_tags_owner_write"
  ON public.marketplace_listing_tags FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  );

-- ── marketplace_activities ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verb TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.marketplace_activities ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.marketplace_activities ADD COLUMN IF NOT EXISTS verb TEXT;
ALTER TABLE public.marketplace_activities ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE public.marketplace_activities ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE public.marketplace_activities ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.marketplace_activities ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.marketplace_activities ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.marketplace_activities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.marketplace_activities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.marketplace_activities ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

UPDATE public.marketplace_activities
SET
  verb = COALESCE(verb, 'listing.created'),
  entity_type = COALESCE(entity_type, 'listing'),
  entity_id = COALESCE(entity_id, id::text),
  summary = COALESCE(summary, ''),
  metadata = COALESCE(metadata, '{}'::jsonb),
  is_public = COALESCE(is_public, false),
  updated_at = COALESCE(updated_at, created_at, now())
WHERE verb IS NULL
   OR entity_type IS NULL
   OR entity_id IS NULL
   OR summary IS NULL
   OR metadata IS NULL
   OR is_public IS NULL
   OR updated_at IS NULL;

ALTER TABLE public.marketplace_activities ALTER COLUMN verb SET NOT NULL;
ALTER TABLE public.marketplace_activities ALTER COLUMN entity_type SET NOT NULL;
ALTER TABLE public.marketplace_activities ALTER COLUMN entity_id SET NOT NULL;
ALTER TABLE public.marketplace_activities ALTER COLUMN summary SET NOT NULL;
ALTER TABLE public.marketplace_activities ALTER COLUMN metadata SET DEFAULT '{}';
ALTER TABLE public.marketplace_activities ALTER COLUMN metadata SET NOT NULL;
ALTER TABLE public.marketplace_activities ALTER COLUMN is_public SET DEFAULT false;
ALTER TABLE public.marketplace_activities ALTER COLUMN is_public SET NOT NULL;
ALTER TABLE public.marketplace_activities ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.marketplace_activities ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.marketplace_activities ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.marketplace_activities ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS marketplace_activities_created_at_idx
  ON public.marketplace_activities (created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_activities_entity_idx
  ON public.marketplace_activities (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS marketplace_activities_public_idx
  ON public.marketplace_activities (is_public, created_at DESC)
  WHERE is_public = true;
CREATE INDEX IF NOT EXISTS marketplace_activities_actor_id_idx
  ON public.marketplace_activities (actor_id) WHERE actor_id IS NOT NULL;

ALTER TABLE public.marketplace_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_activities_public_read" ON public.marketplace_activities;
CREATE POLICY "marketplace_activities_public_read"
  ON public.marketplace_activities FOR SELECT TO anon, authenticated
  USING (is_public = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "marketplace_activities_authenticated_read" ON public.marketplace_activities;
CREATE POLICY "marketplace_activities_authenticated_read"
  ON public.marketplace_activities FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "marketplace_activities_authenticated_insert" ON public.marketplace_activities;
CREATE POLICY "marketplace_activities_authenticated_insert"
  ON public.marketplace_activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id OR actor_id IS NULL);

-- ── shared updated_at trigger for marketplace_activities ────────────────────

CREATE OR REPLACE FUNCTION public.set_marketplace_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS marketplace_activities_updated_at ON public.marketplace_activities;
CREATE TRIGGER marketplace_activities_updated_at
  BEFORE UPDATE ON public.marketplace_activities
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();
