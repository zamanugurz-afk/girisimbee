-- P0: Module-specific profile tables + onboarding tracking

-- ── Onboarding tracker ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_profile_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  module_key public.marketplace_module_key NOT NULL,
  onboarding_step INT NOT NULL DEFAULT 0,
  onboarding_completed_at TIMESTAMPTZ,
  status public.marketplace_profile_module_status NOT NULL DEFAULT 'onboarding',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_profile_modules_profile_module_unique
  ON public.marketplace_profile_modules (profile_id, module_key);

CREATE INDEX IF NOT EXISTS marketplace_profile_modules_profile_id_idx
  ON public.marketplace_profile_modules (profile_id);

CREATE INDEX IF NOT EXISTS marketplace_profile_modules_module_key_idx
  ON public.marketplace_profile_modules (module_key);

-- ── Module 1: Entrepreneurs ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.entrepreneur_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  startup_name TEXT,
  description TEXT,
  city TEXT,
  district TEXT,
  industry TEXT,
  investment_amount NUMERIC(14, 2),
  valuation NUMERIC(14, 2),
  equity_percentage NUMERIC(5, 2),
  company_stage TEXT,
  team_size INT,
  monthly_revenue NUMERIC(14, 2),
  website TEXT,
  pitch_deck_document_id UUID,
  workflow_status public.marketplace_workflow_status NOT NULL DEFAULT 'draft',
  onboarding_step INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entrepreneur_profiles_city_idx
  ON public.entrepreneur_profiles (city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS entrepreneur_profiles_industry_idx
  ON public.entrepreneur_profiles (industry) WHERE industry IS NOT NULL;
CREATE INDEX IF NOT EXISTS entrepreneur_profiles_workflow_status_idx
  ON public.entrepreneur_profiles (workflow_status);

-- ── Module 2: Investors ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.investor_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  minimum_investment NUMERIC(14, 2),
  maximum_investment NUMERIC(14, 2),
  investment_stages TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  cities TEXT[] NOT NULL DEFAULT '{}',
  investment_history JSONB NOT NULL DEFAULT '[]',
  workflow_status public.marketplace_workflow_status NOT NULL DEFAULT 'draft',
  onboarding_step INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investor_profiles_industries_gin
  ON public.investor_profiles USING gin (industries);
CREATE INDEX IF NOT EXISTS investor_profiles_cities_gin
  ON public.investor_profiles USING gin (cities);

-- ── Module 3: Job Seekers (candidates) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  city TEXT,
  district TEXT,
  position TEXT,
  experience_years INT,
  salary_expectation NUMERIC(14, 2),
  languages TEXT[] NOT NULL DEFAULT '{}',
  work_model TEXT,
  education_level TEXT,
  cv_document_id UUID,
  profile_score INT NOT NULL DEFAULT 0,
  workflow_status public.marketplace_workflow_status NOT NULL DEFAULT 'draft',
  onboarding_step INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS candidate_profiles_city_idx
  ON public.candidate_profiles (city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS candidate_profiles_position_idx
  ON public.candidate_profiles (position) WHERE position IS NOT NULL;
CREATE INDEX IF NOT EXISTS candidate_profiles_work_model_idx
  ON public.candidate_profiles (work_model) WHERE work_model IS NOT NULL;

-- ── Module 4: Employers ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.employer_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.marketplace_companies(id) ON DELETE SET NULL,
  city TEXT,
  district TEXT,
  industry TEXT,
  workflow_status public.marketplace_workflow_status NOT NULL DEFAULT 'draft',
  onboarding_step INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS employer_profiles_company_id_idx
  ON public.employer_profiles (company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS employer_profiles_industry_idx
  ON public.employer_profiles (industry) WHERE industry IS NOT NULL;

-- ── Module 5: Co-founders ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.founder_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  city TEXT,
  district TEXT,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  equity_percentage NUMERIC(5, 2),
  specialization TEXT,
  idea_title TEXT,
  idea_description TEXT,
  workflow_status public.marketplace_workflow_status NOT NULL DEFAULT 'draft',
  onboarding_step INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS founder_profiles_specialization_idx
  ON public.founder_profiles (specialization) WHERE specialization IS NOT NULL;
CREATE INDEX IF NOT EXISTS founder_profiles_required_skills_gin
  ON public.founder_profiles USING gin (required_skills);

-- ── Module 6: Franchise ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.franchise_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.marketplace_profiles(id) ON DELETE CASCADE,
  subcategory_slug TEXT CHECK (subcategory_slug IN ('franchise-buy', 'franchise-give')),
  city TEXT,
  district TEXT,
  franchise_fee NUMERIC(14, 2),
  investment_amount NUMERIC(14, 2),
  return_period_months INT,
  sector TEXT,
  workflow_status public.marketplace_workflow_status NOT NULL DEFAULT 'draft',
  onboarding_step INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS franchise_profiles_subcategory_slug_idx
  ON public.franchise_profiles (subcategory_slug) WHERE subcategory_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS franchise_profiles_sector_idx
  ON public.franchise_profiles (sector) WHERE sector IS NOT NULL;

-- ── updated_at triggers ─────────────────────────────────────────────────────

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'marketplace_profile_modules',
    'entrepreneur_profiles',
    'investor_profiles',
    'candidate_profiles',
    'employer_profiles',
    'founder_profiles',
    'franchise_profiles'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at()',
      tbl, tbl
    );
  END LOOP;
END $$;
