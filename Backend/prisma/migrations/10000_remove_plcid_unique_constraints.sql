-- Remove unique constraint on PersonalPlacement.plcId to allow duplicates for "PLC-Passthrough" and "0"
ALTER TABLE "PersonalPlacement" DROP CONSTRAINT IF EXISTS "PersonalPlacement_plcId_key";

-- Remove unique constraint on TeamPlacement.plcId to allow duplicates for "PLC-Passthrough" and "0"
ALTER TABLE "TeamPlacement" DROP CONSTRAINT IF EXISTS "TeamPlacement_plcId_key";

-- Add index on plcId for both tables (for query performance, but not unique)
CREATE INDEX IF NOT EXISTS "PersonalPlacement_plcId_idx" ON "PersonalPlacement"("plcId");
CREATE INDEX IF NOT EXISTS "TeamPlacement_plcId_idx" ON "TeamPlacement"("plcId");
