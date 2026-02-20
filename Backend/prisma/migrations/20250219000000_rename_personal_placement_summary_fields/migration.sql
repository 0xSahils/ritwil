-- Personal placement only: rename summary header fields to "Yearly target" / "achieved"
-- TeamPlacement is unchanged (yearlyPlacementTarget, placementDone)
ALTER TABLE "PersonalPlacement" RENAME COLUMN "yearlyPlacementTarget" TO "yearlyTarget";
ALTER TABLE "PersonalPlacement" RENAME COLUMN "placementDone" TO "achieved";
