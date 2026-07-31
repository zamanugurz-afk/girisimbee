-- P0: Document storage metadata (pitch decks, CVs, franchise brochures)

CREATE TABLE IF NOT EXISTS public.marketplace_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_profile_id UUID NOT NULL REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  document_type public.marketplace_document_type NOT NULL DEFAULT 'other',
  name TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'marketplace-documents',
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  visibility public.marketplace_document_visibility NOT NULL DEFAULT 'private',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS marketplace_documents_owner_profile_id_idx
  ON public.marketplace_documents (owner_profile_id);
CREATE INDEX IF NOT EXISTS marketplace_documents_listing_id_idx
  ON public.marketplace_documents (listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS marketplace_documents_document_type_idx
  ON public.marketplace_documents (document_type);
CREATE INDEX IF NOT EXISTS marketplace_documents_visibility_idx
  ON public.marketplace_documents (visibility) WHERE deleted_at IS NULL;

-- FK from module profile tables to documents (deferred — documents table must exist first)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'entrepreneur_profiles_pitch_deck_document_id_fkey'
  ) THEN
    ALTER TABLE public.entrepreneur_profiles
      ADD CONSTRAINT entrepreneur_profiles_pitch_deck_document_id_fkey
      FOREIGN KEY (pitch_deck_document_id) REFERENCES public.marketplace_documents(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'candidate_profiles_cv_document_id_fkey'
  ) THEN
    ALTER TABLE public.candidate_profiles
      ADD CONSTRAINT candidate_profiles_cv_document_id_fkey
      FOREIGN KEY (cv_document_id) REFERENCES public.marketplace_documents(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Storage bucket for private documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-documents',
  'marketplace-documents',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS marketplace_documents_updated_at ON public.marketplace_documents;
CREATE TRIGGER marketplace_documents_updated_at
  BEFORE UPDATE ON public.marketplace_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at();
