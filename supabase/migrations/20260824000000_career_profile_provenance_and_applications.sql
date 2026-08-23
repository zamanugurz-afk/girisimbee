-- ==============================================================================
-- GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 & CAREER PROFILE PROVENANCE SCHEMA
-- ==============================================================================

-- 1. Extend candidate_profiles with Provenance Graph & Intent Projections
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS provenance_data JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS intent_projections JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS active_intent_mode TEXT NOT NULL DEFAULT 'seek',
  ADD COLUMN IF NOT EXISTS cv_document_id UUID,
  ADD COLUMN IF NOT EXISTS cv_analysis_version TEXT DEFAULT '13.0.0',
  ADD COLUMN IF NOT EXISTS last_confirmed_at TIMESTAMPTZ;

-- 2. Extend marketplace_applications with Immutable Snapshots & Overrides
ALTER TABLE public.marketplace_applications
  ADD COLUMN IF NOT EXISTS application_overrides JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS match_score NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS match_breakdown JSONB NOT NULL DEFAULT '{}';

-- 3. Dedicated CV Extractions Table for Forensic Traceability & Quality Audits
CREATE TABLE IF NOT EXISTS public.cv_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  cv_document_id UUID,
  file_name TEXT,
  raw_text_hash TEXT NOT NULL,
  quality_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  deterministic_count INT NOT NULL DEFAULT 0,
  ai_called BOOLEAN NOT NULL DEFAULT false,
  extraction_payload JSONB NOT NULL DEFAULT '{}',
  evidence_graph JSONB NOT NULL DEFAULT '{}',
  contradictions JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'RESOLVED' CHECK (status IN ('RESOLVED', 'AMBIGUOUS', 'NOT_FOUND', 'CONFLICT', 'ERROR')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for high-throughput $O(1)$ lookup
CREATE INDEX IF NOT EXISTS cv_extractions_profile_id_idx
  ON public.cv_extractions (profile_id);

CREATE INDEX IF NOT EXISTS cv_extractions_raw_text_hash_idx
  ON public.cv_extractions (raw_text_hash);

CREATE INDEX IF NOT EXISTS cv_extractions_created_at_idx
  ON public.cv_extractions (created_at DESC);

-- 4. Enable Row Level Security (RLS) on cv_extractions
ALTER TABLE public.cv_extractions ENABLE ROW LEVEL SECURITY;

-- Owner-only Access Policies (Zero Cross-User Data Leakage)
CREATE POLICY cv_extractions_owner_select ON public.cv_extractions
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY cv_extractions_owner_insert ON public.cv_extractions
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY cv_extractions_owner_update ON public.cv_extractions
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY cv_extractions_owner_delete ON public.cv_extractions
  FOR DELETE USING (profile_id = auth.uid());
