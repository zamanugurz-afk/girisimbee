-- Girişimco MARKET module — curated homepage market cards (max 5 published).
-- Admin / super_admin: full manage. Moderator: read-only (via app + RLS).

CREATE TABLE IF NOT EXISTS public.marketplace_market_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  link_url TEXT,
  cta_label TEXT NOT NULL DEFAULT 'İncele',
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_marketplace_market_items_status
  ON public.marketplace_market_items (status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_marketplace_market_items_sort
  ON public.marketplace_market_items (sort_order ASC, published_at DESC NULLS LAST)
  WHERE deleted_at IS NULL AND status = 'published';

COMMENT ON TABLE public.marketplace_market_items IS
  'Girişimco MARKET — admin-curated promotional cards (max 5 published on homepage).';

-- Staff helpers (do not replace global is_admin)
CREATE OR REPLACE FUNCTION public.is_market_staff(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid
      AND role IN ('admin', 'super_admin', 'moderator')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_market(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid
      AND role IN ('admin', 'super_admin')
  );
$$;

-- updated_at trigger (reuse if present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_marketplace_updated_at'
  ) THEN
    CREATE TRIGGER trg_marketplace_market_items_updated_at
      BEFORE UPDATE ON public.marketplace_market_items
      FOR EACH ROW
      EXECUTE FUNCTION public.set_marketplace_updated_at();
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.marketplace_market_items ENABLE ROW LEVEL SECURITY;

-- Public: published cards only
DROP POLICY IF EXISTS marketplace_market_items_public_select ON public.marketplace_market_items;
CREATE POLICY marketplace_market_items_public_select
  ON public.marketplace_market_items
  FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL AND status = 'published');

-- Staff: list all non-deleted (including drafts) — moderators included
DROP POLICY IF EXISTS marketplace_market_items_staff_select ON public.marketplace_market_items;
CREATE POLICY marketplace_market_items_staff_select
  ON public.marketplace_market_items
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL AND public.is_market_staff());

-- Admin / super_admin write
DROP POLICY IF EXISTS marketplace_market_items_admin_insert ON public.marketplace_market_items;
CREATE POLICY marketplace_market_items_admin_insert
  ON public.marketplace_market_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_market());

DROP POLICY IF EXISTS marketplace_market_items_admin_update ON public.marketplace_market_items;
CREATE POLICY marketplace_market_items_admin_update
  ON public.marketplace_market_items
  FOR UPDATE
  TO authenticated
  USING (public.can_manage_market())
  WITH CHECK (public.can_manage_market());

DROP POLICY IF EXISTS marketplace_market_items_admin_delete ON public.marketplace_market_items;
CREATE POLICY marketplace_market_items_admin_delete
  ON public.marketplace_market_items
  FOR DELETE
  TO authenticated
  USING (public.can_manage_market());

-- Cap published items at 5 (app also enforces; DB safety net)
CREATE OR REPLACE FUNCTION public.enforce_market_publish_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    IF (
      SELECT COUNT(*) FROM public.marketplace_market_items
      WHERE deleted_at IS NULL
        AND status = 'published'
        AND id IS DISTINCT FROM NEW.id
    ) >= 5 THEN
      RAISE EXCEPTION 'En fazla 5 MARKET kartı yayınlanabilir.';
    END IF;
    IF NEW.published_at IS NULL THEN
      NEW.published_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marketplace_market_publish_limit ON public.marketplace_market_items;
CREATE TRIGGER trg_marketplace_market_publish_limit
  BEFORE INSERT OR UPDATE ON public.marketplace_market_items
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_market_publish_limit();
