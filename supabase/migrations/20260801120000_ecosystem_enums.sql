-- P0: Girişimco ecosystem domain enums
-- Idempotent: CREATE TYPE IF NOT EXISTS via DO blocks

DO $$ BEGIN
  CREATE TYPE public.marketplace_module_key AS ENUM (
    'entrepreneurs',
    'investors',
    'candidates',
    'employers',
    'founders',
    'franchise'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_match_status AS ENUM (
    'requested',
    'accepted',
    'declined',
    'contacted',
    'closed_won',
    'closed_lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_application_status AS ENUM (
    'submitted',
    'reviewing',
    'unlocked',
    'contacted',
    'accepted',
    'rejected',
    'withdrawn',
    'hired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_payment_status AS ENUM (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'refunded',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_payment_provider AS ENUM (
    'iyzico',
    'stripe',
    'paytr'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_payment_purpose AS ENUM (
    'publish',
    'unlock_candidate',
    'featured',
    'urgent',
    'package_purchase'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_document_type AS ENUM (
    'pitch_deck',
    'cv',
    'contract',
    'franchise_brochure',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_document_visibility AS ENUM (
    'private',
    'match_only',
    'application_only',
    'public'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_workflow_status AS ENUM (
    'draft',
    'profile_created',
    'onboarding',
    'ready',
    'published',
    'matching',
    'reviewing',
    'negotiating',
    'completed',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_profile_module_status AS ENUM (
    'inactive',
    'onboarding',
    'active',
    'suspended'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.marketplace_subcategory_status AS ENUM (
    'active',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
