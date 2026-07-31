-- P4: Candidate profile extended fields (job seeker module)

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS sehir TEXT,
  ADD COLUMN IF NOT EXISTS ilce TEXT,
  ADD COLUMN IF NOT EXISTS education TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS certifications TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS remote_preference TEXT,
  ADD COLUMN IF NOT EXISTS linked_in TEXT,
  ADD COLUMN IF NOT EXISTS portfolio TEXT,
  ADD COLUMN IF NOT EXISTS telefon TEXT,
  ADD COLUMN IF NOT EXISTS eposta TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;

CREATE INDEX IF NOT EXISTS candidate_profiles_sehir_idx
  ON public.candidate_profiles (sehir) WHERE sehir IS NOT NULL;

CREATE INDEX IF NOT EXISTS candidate_profiles_full_name_idx
  ON public.candidate_profiles (full_name) WHERE full_name IS NOT NULL;
