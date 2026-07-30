-- Extend ai_analysis with full AI Opportunity Engine fields
-- Adds: price_score, risk_score, overall_score, confidence_label,
--       ai_summary, expected_accepted_price, negotiation_probability, content_hash

ALTER TABLE ai_analysis
  ADD COLUMN IF NOT EXISTS price_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overall_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS confidence_label text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS expected_accepted_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS negotiation_probability integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS content_hash text;

CREATE INDEX IF NOT EXISTS idx_ai_analysis_overall_score ON ai_analysis(overall_score);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_content_hash ON ai_analysis(content_hash);
