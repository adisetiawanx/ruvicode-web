-- Financial data must survive account deletion for audit and internal
-- reporting. Instead of blocking the delete (NO ACTION) or wiping the
-- rows (CASCADE), set user_id to NULL so the records stay but are
-- anonymized. The address column on deposit_addresses is kept for
-- chain audit even after the user is gone.

-- usage_records.user_id: keep cost/token audit trail, anonymize user
ALTER TABLE usage_records DROP CONSTRAINT IF EXISTS usage_records_user_id_user_id_fk;
ALTER TABLE usage_records ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE usage_records ADD CONSTRAINT usage_records_user_id_user_id_fk
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;

-- usage_records.api_key_id: already shows "Deleted key" in the UI when
-- the key is gone; make the FK match that behavior
ALTER TABLE usage_records DROP CONSTRAINT IF EXISTS usage_records_api_key_id_api_keys_id_fk;
ALTER TABLE usage_records ALTER COLUMN api_key_id DROP NOT NULL;
ALTER TABLE usage_records ADD CONSTRAINT usage_records_api_key_id_api_keys_id_fk
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL;

-- topups.user_id: keep payment records for financial reconciliation
ALTER TABLE topups DROP CONSTRAINT IF EXISTS topups_user_id_user_id_fk;
ALTER TABLE topups ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE topups ADD CONSTRAINT topups_user_id_user_id_fk
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;

-- usage_hourly.user_id: same rationale (aggregated cost history)
ALTER TABLE usage_hourly DROP CONSTRAINT IF EXISTS usage_hourly_user_id_user_id_fk;
ALTER TABLE usage_hourly ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE usage_hourly ADD CONSTRAINT usage_hourly_user_id_user_id_fk
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;

-- deposit_addresses.user_id: keep the on-chain address for audit even
-- after the user is deleted (the address still holds recoverable USDC)
ALTER TABLE deposit_addresses DROP CONSTRAINT IF EXISTS deposit_addresses_user_id_user_id_fk;
ALTER TABLE deposit_addresses ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE deposit_addresses ADD CONSTRAINT deposit_addresses_user_id_user_id_fk
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;
