-- AlterTable
ALTER TABLE "PlacementImportBatch" ADD COLUMN IF NOT EXISTS "errors" JSONB;
