-- Drop redundant EmployeeProfile columns. Summary data is read from PersonalPlacement/TeamPlacement only.
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "placementsDone";
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "targetAchievementStatus";
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "totalRevenue";
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "revenueAch";
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "revenueTargetAchievedPercent";
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "totalIncentiveAmount";
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "totalIncentivePaid";
ALTER TABLE "EmployeeProfile" DROP COLUMN IF EXISTS "individualSynopsis";
