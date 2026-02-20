-- Align TeamPlacement with generated client: rename columns to match (yearlyTarget, achieved)
ALTER TABLE "TeamPlacement" RENAME COLUMN "yearlyPlacementTarget" TO "yearlyTarget";
ALTER TABLE "TeamPlacement" RENAME COLUMN "placementDone" TO "achieved";
