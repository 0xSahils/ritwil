import prisma from './src/prisma.js';

async function main() {
  try {
    console.log('Starting data cleanup...');

    // 1. Delete all personal placements
    const deletedPersonal = await prisma.personalPlacement.deleteMany({});
    console.log(`Deleted ${deletedPersonal.count} personal placements.`);

    // 2. Delete all team placements
    const deletedTeamPlacements = await prisma.teamPlacement.deleteMany({});
    console.log(`Deleted ${deletedTeamPlacements.count} team placements.`);

    // 3. Reset targets in EmployeeProfile
    const updatedProfiles = await prisma.employeeProfile.updateMany({
      data: {
        yearlyTarget: 0,
        yearlyRevenueTarget: 0,
        yearlyPlacementTarget: 0,
        totalRevenue: 0,
        placementsDone: 0,
        revenueAch: 0,
        revenueTargetAchievedPercent: 0,
        totalIncentiveAmount: 0,
        totalIncentivePaid: 0
      }
    });
    console.log(`Reset targets for ${updatedProfiles.count} employee profiles.`);

    // 4. Reset targets in Team
    const updatedTeams = await prisma.team.updateMany({
      data: {
        yearlyTarget: 0
      }
    });
    console.log(`Reset targets for ${updatedTeams.count} teams.`);

    console.log('Data cleanup complete.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
