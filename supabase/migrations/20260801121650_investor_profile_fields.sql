-- P4: Investor profile field columns (Yatırım Yap)

ALTER TABLE public.investor_profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS sehir TEXT,
  ADD COLUMN IF NOT EXISTS ilce TEXT,
  ADD COLUMN IF NOT EXISTS investor_type TEXT,
  ADD COLUMN IF NOT EXISTS investment_stage TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_size INT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS telefon TEXT,
  ADD COLUMN IF NOT EXISTS eposta TEXT;

CREATE INDEX IF NOT EXISTS investor_profiles_full_name_idx
  ON public.investor_profiles (full_name) WHERE full_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS investor_profiles_sehir_idx
  ON public.investor_profiles (sehir) WHERE sehir IS NOT NULL;

CREATE INDEX IF NOT EXISTS investor_profiles_investor_type_idx
  ON public.investor_profiles (investor_type) WHERE investor_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS investor_profiles_investment_stage_idx
  ON public.investor_profiles (investment_stage) WHERE investment_stage IS NOT NULL;
