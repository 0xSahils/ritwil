import prisma from '../src/prisma.js';

async function main() {
  console.log('Clearing all placement data...');
  
  // Delete all placements
  const personalDeleted = await prisma.personalPlacement.deleteMany({}).catch(() => ({ count: 0 }));
  const teamDeleted = await prisma.teamPlacement.deleteMany({}).catch(() => ({ count: 0 }));
  const batchDeleted = await prisma.placementImportBatch.deleteMany({}).catch(() => ({ count: 0 }));
  
  console.log(`Deleted ${personalDeleted.count} personal placements`);
  console.log(`Deleted ${teamDeleted.count} team placements`);
  console.log(`Deleted ${batchDeleted.count} import batches`);
  
  // Reset EmployeeProfile summary fields (yearlyTarget can't be null, so set to 0)
  const profilesUpdated = await prisma.employeeProfile.updateMany({
    data: {
      yearlyTarget: 0,
      yearlyRevenueTarget: null,
      yearlyPlacementTarget: null,
      placementsDone: null,
      totalRevenue: null,
      slabQualified: null,
      totalIncentiveAmount: null,
      totalIncentivePaid: null,
    },
  });
  
  console.log(`Reset ${profilesUpdated.count} employee profiles`);
  console.log('All placement data cleared!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
