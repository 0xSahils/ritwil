-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'TEAM_LEAD', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "PlacementType" AS ENUM ('PERMANENT', 'CONTRACT');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('PENDING', 'BILLED', 'CANCELLED', 'HOLD');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "yearlyTarget" DECIMAL(14,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeProfile" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "managerId" TEXT,
    "level" TEXT,
    "yearlyTarget" DECIMAL(14,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clientName" TEXT NOT NULL,
    "placementType" "PlacementType" NOT NULL,
    "revenue" DECIMAL(14,2) NOT NULL,
    "marginPercent" DECIMAL(5,2) NOT NULL,
    "billingStatus" "BillingStatus" NOT NULL,
    "doi" TIMESTAMP(3) NOT NULL,
    "doj" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "doi" TIMESTAMP(3) NOT NULL,
    "doj" TIMESTAMP(3) NOT NULL,
    "daysCompleted" INTEGER NOT NULL,
    "placementType" "PlacementType" NOT NULL,
    "billedHours" INTEGER,
    "marginPercent" DECIMAL(5,2) NOT NULL,
    "revenue" DECIMAL(14,2) NOT NULL,
    "billingStatus" "BillingStatus" NOT NULL,
    "incentivePayoutEta" TIMESTAMP(3),
    "incentiveAmountInr" DECIMAL(14,2) NOT NULL,
    "incentivePaid" BOOLEAN NOT NULL,
    "qualifier" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyBilling" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "hours" INTEGER,
    "status" "BillingStatus" NOT NULL,

    CONSTRAINT "MonthlyBilling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incentive" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "revenueTotal" DECIMAL(14,2) NOT NULL,
    "slabName" TEXT NOT NULL,
    "amountUsd" DECIMAL(14,2) NOT NULL,
    "amountInr" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Incentive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "targetAmount" DECIMAL(14,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignImage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignTeamLead" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignTeamLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignAssignment" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "targetAmount" DECIMAL(14,2) NOT NULL,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignTask" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedById" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignActivity" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE INDEX "Team_isActive_idx" ON "Team"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "EmployeeProfile_teamId_idx" ON "EmployeeProfile"("teamId");

-- CreateIndex
CREATE INDEX "EmployeeProfile_managerId_idx" ON "EmployeeProfile"("managerId");

-- CreateIndex
CREATE INDEX "EmployeeProfile_isActive_idx" ON "EmployeeProfile"("isActive");

-- CreateIndex
CREATE INDEX "DailyEntry_employeeId_date_idx" ON "DailyEntry"("employeeId", "date");

-- CreateIndex
CREATE INDEX "DailyEntry_billingStatus_idx" ON "DailyEntry"("billingStatus");

-- CreateIndex
CREATE INDEX "Placement_employeeId_idx" ON "Placement"("employeeId");

-- CreateIndex
CREATE INDEX "Placement_billingStatus_idx" ON "Placement"("billingStatus");

-- CreateIndex
CREATE INDEX "MonthlyBilling_placementId_idx" ON "MonthlyBilling"("placementId");

-- CreateIndex
CREATE INDEX "MonthlyBilling_status_idx" ON "MonthlyBilling"("status");

-- CreateIndex
CREATE INDEX "Incentive_employeeId_periodStart_periodEnd_idx" ON "Incentive"("employeeId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_startDate_endDate_idx" ON "Campaign"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "CampaignImage_campaignId_idx" ON "CampaignImage"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignTeamLead_userId_idx" ON "CampaignTeamLead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignTeamLead_campaignId_userId_key" ON "CampaignTeamLead"("campaignId", "userId");

-- CreateIndex
CREATE INDEX "CampaignAssignment_campaignId_idx" ON "CampaignAssignment"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignAssignment_userId_idx" ON "CampaignAssignment"("userId");

-- CreateIndex
CREATE INDEX "CampaignTask_campaignId_idx" ON "CampaignTask"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignTask_assignmentId_idx" ON "CampaignTask"("assignmentId");

-- CreateIndex
CREATE INDEX "CampaignActivity_campaignId_idx" ON "CampaignActivity"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignActivity_userId_idx" ON "CampaignActivity"("userId");

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyBilling" ADD CONSTRAINT "MonthlyBilling_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignImage" ADD CONSTRAINT "CampaignImage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignImage" ADD CONSTRAINT "CampaignImage_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTeamLead" ADD CONSTRAINT "CampaignTeamLead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTeamLead" ADD CONSTRAINT "CampaignTeamLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAssignment" ADD CONSTRAINT "CampaignAssignment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAssignment" ADD CONSTRAINT "CampaignAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTask" ADD CONSTRAINT "CampaignTask_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTask" ADD CONSTRAINT "CampaignTask_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "CampaignAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTask" ADD CONSTRAINT "CampaignTask_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignActivity" ADD CONSTRAINT "CampaignActivity_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignActivity" ADD CONSTRAINT "CampaignActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
