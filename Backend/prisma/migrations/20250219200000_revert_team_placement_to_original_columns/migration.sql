-- Revert TeamPlacement to original column names (yearlyPlacementTarget, placementDone)
ALTER TABLE "TeamPlacement" RENAME COLUMN "yearlyTarget" TO "yearlyPlacementTarget";
ALTER TABLE "TeamPlacement" RENAME COLUMN "achieved" TO "placementDone";
