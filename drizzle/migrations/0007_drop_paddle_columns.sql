-- Remove the Paddle card top-up integration (application rejected; card
-- payments are no longer offered). 0 rows ever used paddle_transaction_id,
-- so the column and its index can be dropped safely. The "paddle" enum
-- value stays in topup_method (dropping enum values in Postgres requires
-- a type rebuild; the unused value is harmless).
DROP INDEX IF EXISTS idx_topups_paddle;
ALTER TABLE topups DROP COLUMN IF EXISTS paddle_transaction_id;
