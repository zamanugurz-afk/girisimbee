-- Support DMs in Mesajlarım: conversations without a listing (admin ↔ user).

ALTER TABLE public.marketplace_conversations
  ALTER COLUMN listing_id DROP NOT NULL;

ALTER TABLE public.marketplace_conversations
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'listing';

ALTER TABLE public.marketplace_conversations
  DROP CONSTRAINT IF EXISTS marketplace_conversations_kind_check;

ALTER TABLE public.marketplace_conversations
  ADD CONSTRAINT marketplace_conversations_kind_check
  CHECK (kind IN ('listing', 'support'));

ALTER TABLE public.marketplace_conversations
  ADD COLUMN IF NOT EXISTS support_inquiry_id UUID
  REFERENCES public.marketplace_support_inquiries(id) ON DELETE SET NULL;

ALTER TABLE public.marketplace_conversations
  DROP CONSTRAINT IF EXISTS marketplace_conversations_listing_or_support_chk;

ALTER TABLE public.marketplace_conversations
  ADD CONSTRAINT marketplace_conversations_listing_or_support_chk
  CHECK (
    (kind = 'listing' AND listing_id IS NOT NULL)
    OR (kind = 'support' AND listing_id IS NULL)
  );

CREATE INDEX IF NOT EXISTS marketplace_conversations_kind_idx
  ON public.marketplace_conversations (kind)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS marketplace_conversations_support_inquiry_idx
  ON public.marketplace_conversations (support_inquiry_id)
  WHERE support_inquiry_id IS NOT NULL;

ALTER TABLE public.marketplace_support_inquiries
  ADD COLUMN IF NOT EXISTS conversation_id UUID
  REFERENCES public.marketplace_conversations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS marketplace_support_inquiries_conversation_idx
  ON public.marketplace_support_inquiries (conversation_id)
  WHERE conversation_id IS NOT NULL;
