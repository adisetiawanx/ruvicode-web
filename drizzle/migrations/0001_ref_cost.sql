-- ADR-019 S10: store the reference cost per request so the dashboard can show
-- real savings (reference - user price) instead of the Ruvicode margin.
-- Backfill existing rows from model_prices so historical data is not blank.
ALTER TABLE usage_records
  ADD COLUMN IF NOT EXISTS ref_cost DECIMAL(12,8) NOT NULL DEFAULT 0;

UPDATE usage_records ur
  SET ref_cost = COALESCE(
    (ur.prompt_tokens / 1000000.0) * mp.ref_input
  + (ur.completion_tokens / 1000000.0) * mp.ref_output,
    ur.cost
  )
FROM model_prices mp
WHERE ur.model = mp.model;
