import prisma from './src/prisma.js';

async function cleanup() {
  console.log('--- Starting Database Cleanup ---');
  try {
    // Delete placements and imports first (foreign key order)
    const delTP = await prisma.teamPlacement.deleteMany({});
    console.log(`Deleted ${delTP.count} TeamPlacements`);

    const delPP = await prisma.personalPlacement.deleteMany({});
    console.log(`Deleted ${delPP.count} PersonalPlacements`);

    const delOldP = await prisma.placement.deleteMany({});
    console.log(`Deleted ${delOldP.count} old Placements`);

    const delBatches = await prisma.placementImportBatch.deleteMany({});
    console.log(`Deleted ${delBatches.count} ImportBatches`);

    // Reset some profile metrics to ensure fresh start
    const resetProfiles = await prisma.employeeProfile.updateMany({
      data: {
        yearlyPlacementTarget: null,
        placementsDone: null,
        targetAchievementStatus: null,
        yearlyRevenueTarget: null,
        revenueAch: null,
        revenueTargetAchievedPercent: null,
        totalRevenue: null,
        slabQualified: null,
        totalIncentiveAmount: null,
        totalIncentivePaid: null,
      }
    });
    console.log(`Reset ${resetProfiles.count} EmployeeProfiles`);

    console.log('--- Cleanup Successful ---');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
