-- P4: Employer profile company-focused field columns

ALTER TABLE public.employer_profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS sehir TEXT,
  ADD COLUMN IF NOT EXISTS ilce TEXT,
  ADD COLUMN IF NOT EXISTS sektor TEXT,
  ADD COLUMN IF NOT EXISTS aciklama TEXT,
  ADD COLUMN IF NOT EXISTS telefon TEXT,
  ADD COLUMN IF NOT EXISTS eposta TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT;

CREATE INDEX IF NOT EXISTS employer_profiles_company_name_idx
  ON public.employer_profiles (company_name) WHERE company_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS employer_profiles_sehir_idx
  ON public.employer_profiles (sehir) WHERE sehir IS NOT NULL;
