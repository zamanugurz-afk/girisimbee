-- P4: Franchise application workflow extensions
-- Notes and status history stored in metadata.franchise JSONB;
-- reviewed_at column for franchisor review timestamp queries.

ALTER TABLE public.marketplace_applications
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS marketplace_applications_reviewed_at_idx
  ON public.marketplace_applications (reviewed_at)
  WHERE reviewed_at IS NOT NULL AND module_key = 'franchise';

COMMENT ON COLUMN public.marketplace_applications.reviewed_at IS
  'Timestamp when franchisor first marked application as reviewing (franchise module).';

COMMENT ON COLUMN public.marketplace_applications.metadata IS
  'JSONB metadata; franchise applications use metadata.franchise.notes and metadata.franchise.statusHistory.';
