-- P4: Founder profile field columns (Ortak Bul)

ALTER TABLE public.founder_profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS sehir TEXT,
  ADD COLUMN IF NOT EXISTS ilce TEXT,
  ADD COLUMN IF NOT EXISTS founder_type TEXT,
  ADD COLUMN IF NOT EXISTS startup_stage TEXT,
  ADD COLUMN IF NOT EXISTS sectors TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS offered_skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS telefon TEXT,
  ADD COLUMN IF NOT EXISTS eposta TEXT;

CREATE INDEX IF NOT EXISTS founder_profiles_full_name_idx
  ON public.founder_profiles (full_name) WHERE full_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS founder_profiles_sehir_idx
  ON public.founder_profiles (sehir) WHERE sehir IS NOT NULL;

CREATE INDEX IF NOT EXISTS founder_profiles_founder_type_idx
  ON public.founder_profiles (founder_type) WHERE founder_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS founder_profiles_startup_stage_idx
  ON public.founder_profiles (startup_stage) WHERE startup_stage IS NOT NULL;
