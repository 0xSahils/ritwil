-- CreateEnum
CREATE TYPE "PlacementImportType" AS ENUM ('PERSONAL', 'TEAM');

-- CreateTable
CREATE TABLE "PlacementImportBatch" (
    "id" TEXT NOT NULL,
    "type" "PlacementImportType" NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacementImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalPlacement" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "batchId" TEXT,
    "candidateName" TEXT NOT NULL,
    "placementYear" INTEGER,
    "doj" TIMESTAMP(3) NOT NULL,
    "doq" TIMESTAMP(3),
    "client" TEXT NOT NULL,
    "plcId" TEXT NOT NULL,
    "placementType" TEXT NOT NULL,
    "billingStatus" TEXT NOT NULL,
    "collectionStatus" TEXT,
    "totalBilledHours" INTEGER,
    "revenueUsd" DECIMAL(14,2) NOT NULL,
    "incentiveInr" DECIMAL(14,2) NOT NULL,
    "incentivePaidInr" DECIMAL(14,2),
    "vbCode" TEXT,
    "recruiterName" TEXT,
    "teamLeadName" TEXT,
    "yearlyPlacementTarget" DECIMAL(14,2),
    "placementDone" INTEGER,
    "targetAchievedPercent" DECIMAL(5,2),
    "totalRevenueGenerated" DECIMAL(14,2),
    "slabQualified" TEXT,
    "totalIncentiveInr" DECIMAL(14,2),
    "totalIncentivePaidInr" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPlacement" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "batchId" TEXT,
    "candidateName" TEXT NOT NULL,
    "recruiterName" TEXT,
    "leadName" TEXT,
    "splitWith" TEXT,
    "placementYear" INTEGER,
    "doj" TIMESTAMP(3) NOT NULL,
    "doq" TIMESTAMP(3),
    "client" TEXT NOT NULL,
    "plcId" TEXT NOT NULL,
    "placementType" TEXT NOT NULL,
    "billingStatus" TEXT NOT NULL,
    "collectionStatus" TEXT,
    "totalBilledHours" INTEGER,
    "revenueLeadUsd" DECIMAL(14,2) NOT NULL,
    "incentiveInr" DECIMAL(14,2) NOT NULL,
    "incentivePaidInr" DECIMAL(14,2),
    "vbCode" TEXT,
    "yearlyPlacementTarget" DECIMAL(14,2),
    "placementDone" INTEGER,
    "placementAchPercent" DECIMAL(5,2),
    "yearlyRevenueTarget" DECIMAL(14,2),
    "revenueAch" DECIMAL(14,2),
    "revenueTargetAchievedPercent" DECIMAL(5,2),
    "totalRevenueGenerated" DECIMAL(14,2),
    "slabQualified" TEXT,
    "totalIncentiveInr" DECIMAL(14,2),
    "totalIncentivePaidInr" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlacementImportBatch_type_idx" ON "PlacementImportBatch"("type");

-- CreateIndex
CREATE INDEX "PlacementImportBatch_uploaderId_idx" ON "PlacementImportBatch"("uploaderId");

-- CreateIndex
CREATE INDEX "PersonalPlacement_employeeId_idx" ON "PersonalPlacement"("employeeId");

-- CreateIndex
CREATE INDEX "PersonalPlacement_placementYear_idx" ON "PersonalPlacement"("placementYear");

-- CreateIndex
CREATE INDEX "PersonalPlacement_plcId_idx" ON "PersonalPlacement"("plcId");

-- CreateIndex
CREATE INDEX "TeamPlacement_leadId_idx" ON "TeamPlacement"("leadId");

-- CreateIndex
CREATE INDEX "TeamPlacement_placementYear_idx" ON "TeamPlacement"("placementYear");

-- CreateIndex
CREATE INDEX "TeamPlacement_plcId_idx" ON "TeamPlacement"("plcId");

-- AddForeignKey
ALTER TABLE "PlacementImportBatch" ADD CONSTRAINT "PlacementImportBatch_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalPlacement" ADD CONSTRAINT "PersonalPlacement_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalPlacement" ADD CONSTRAINT "PersonalPlacement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "PlacementImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlacement" ADD CONSTRAINT "TeamPlacement_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlacement" ADD CONSTRAINT "TeamPlacement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "PlacementImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
