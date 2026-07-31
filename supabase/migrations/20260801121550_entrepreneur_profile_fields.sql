-- P4: Entrepreneur profile field columns (Yatırım Bul)

ALTER TABLE public.entrepreneur_profiles
  ADD COLUMN IF NOT EXISTS founder_name TEXT,
  ADD COLUMN IF NOT EXISTS sehir TEXT,
  ADD COLUMN IF NOT EXISTS sektor TEXT,
  ADD COLUMN IF NOT EXISTS investment_stage TEXT,
  ADD COLUMN IF NOT EXISTS investment_target NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS business_model TEXT,
  ADD COLUMN IF NOT EXISTS telefon TEXT,
  ADD COLUMN IF NOT EXISTS eposta TEXT;

CREATE INDEX IF NOT EXISTS entrepreneur_profiles_founder_name_idx
  ON public.entrepreneur_profiles (founder_name) WHERE founder_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS entrepreneur_profiles_sehir_idx
  ON public.entrepreneur_profiles (sehir) WHERE sehir IS NOT NULL;

CREATE INDEX IF NOT EXISTS entrepreneur_profiles_sektor_idx
  ON public.entrepreneur_profiles (sektor) WHERE sektor IS NOT NULL;

CREATE INDEX IF NOT EXISTS entrepreneur_profiles_investment_stage_idx
  ON public.entrepreneur_profiles (investment_stage) WHERE investment_stage IS NOT NULL;
