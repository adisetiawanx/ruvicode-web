-- S18 fix: the deposit-address allocator claims HD derivation indexes with
-- SELECT MAX + INSERT, which races under concurrent first signups: two users
-- could both read the same MAX and one would silently take over the other's
-- address row (the composite unique on (user_id, address) does not prevent
-- it). A global unique index on derivation_index makes the second claim fail
-- with SQLSTATE 23505, which the allocator's retry loop already handles.
-- No duplicate indexes existed when this was verified on 27 Aug 2026, so the
-- index builds safely against the live table.
CREATE UNIQUE INDEX IF NOT EXISTS "idx_deposit_derivation_index"
  ON "deposit_addresses" ("derivation_index");
