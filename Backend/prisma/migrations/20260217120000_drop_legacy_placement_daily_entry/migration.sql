-- Drop legacy tables (already dropped manually in Supabase; this records the migration)
DROP TABLE IF EXISTS "MonthlyBilling";
DROP TABLE IF EXISTS "Placement";
DROP TABLE IF EXISTS "DailyEntry";
