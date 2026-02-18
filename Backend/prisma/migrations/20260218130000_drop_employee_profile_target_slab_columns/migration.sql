-- Targets and slab come from PersonalPlacement/TeamPlacement only; no profile fallback.
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "yearlyTarget";
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "yearlyRevenueTarget";
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "yearlyPlacementTarget";
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "slabQualified";
