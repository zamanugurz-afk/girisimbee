-- Job applications + career profile immutable snapshot + messaging integration

-- 1) Extend marketplace_applications with profile_snapshot and conversation_id
ALTER TABLE public.marketplace_applications
  ADD COLUMN IF NOT EXISTS profile_snapshot JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.marketplace_conversations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS marketplace_applications_conversation_id_idx
  ON public.marketplace_applications (conversation_id)
  WHERE conversation_id IS NOT NULL;

-- 2) Extend marketplace_conversations with application_id and kind
ALTER TABLE public.marketplace_conversations
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.marketplace_applications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'listing';

CREATE INDEX IF NOT EXISTS marketplace_conversations_application_id_idx
  ON public.marketplace_conversations (application_id)
  WHERE application_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS marketplace_conversations_kind_idx
  ON public.marketplace_conversations (kind);

-- 3) RLS helper: ensure listing manager and applicant can access their application and profile_snapshot
CREATE OR REPLACE FUNCTION public.can_view_application_profile_snapshot(p_application_id UUID, uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.marketplace_applications a
    JOIN public.marketplace_profiles p ON p.id = a.applicant_profile_id
    JOIN public.marketplace_listings l ON l.id = a.listing_id
    WHERE a.id = p_application_id
      AND a.deleted_at IS NULL
      AND (
        p.user_id = uid -- Applicant
        OR l.owner_id = uid -- Listing manager / employer
        OR public.is_admin() -- Admin
      )
  );
$$;
