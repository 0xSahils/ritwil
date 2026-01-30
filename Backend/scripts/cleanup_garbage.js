
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Starting cleanup...");

  try {
    // 1. Fetch all placements and filter in JS for safety
    const allPlacements = await prisma.placement.findMany({
      select: { id: true, clientName: true, candidateName: true }
    });
    
    const badPlacementIds = allPlacements
      .filter(p => /^\d+(\.\d+)?$/.test(p.clientName) || /^\d+(\.\d+)?$/.test(p.candidateName))
      .map(p => p.id);

    if (badPlacementIds.length > 0) {
      console.log(`Found ${badPlacementIds.length} garbage placements. Deleting relations first...`);
      
      // Delete related MonthlyBilling first
      const mb = await prisma.monthlyBilling.deleteMany({
          where: { placementId: { in: badPlacementIds } }
      });
      console.log(`Deleted ${mb.count} related MonthlyBilling records.`);

      // Delete the placements
      const deletedPlacements = await prisma.placement.deleteMany({
        where: { id: { in: badPlacementIds } }
      });
      console.log(`Deleted ${deletedPlacements.count} garbage placements.`);
    } else {
      console.log("No garbage placements found.");
    }

    // 2. Delete Users where Name is numeric or garbage
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true }
    });

    const garbageNames = ['Slab qualified', 'Team', 'Incentive in USD', 'Total Incentive in INR', 'Incentive Qualified'];

    const badUserIds = allUsers
      .filter(u => /^\d+(\.\d+)?$/.test(u.name) || garbageNames.includes(u.name))
      .map(u => u.id);

    if (badUserIds.length > 0) {
      console.log(`Found ${badUserIds.length} garbage users. Deleting relations...`);
      
      // Placements (if any left for these users)
      const userPlacements = await prisma.placement.findMany({ where: { employeeId: { in: badUserIds } } });
      const userPlacementIds = userPlacements.map(p => p.id);
      
      if (userPlacementIds.length > 0) {
           await prisma.monthlyBilling.deleteMany({ where: { placementId: { in: userPlacementIds } } });
           await prisma.placement.deleteMany({ where: { id: { in: userPlacementIds } } });
      }

      // Other relations
      await prisma.refreshToken.deleteMany({ where: { userId: { in: badUserIds } } });
      
      // DailyEntry uses employeeId
      await prisma.dailyEntry.deleteMany({ where: { employeeId: { in: badUserIds } } });
      
      // Incentive uses employeeId
      await prisma.incentive.deleteMany({ where: { employeeId: { in: badUserIds } } });

      // EmployeeProfile uses id (same as user id)
      await prisma.employeeProfile.deleteMany({ where: { id: { in: badUserIds } } });

      // Campaign relations (if any)
      // Note: If there are other relations like CampaignAssignment, they need to be handled.
      // Assuming for now these garbage users don't have complex campaign data.
      
      const deletedUsers = await prisma.user.deleteMany({
        where: { id: { in: badUserIds } }
      });
      console.log(`Deleted ${deletedUsers.count} garbage users (numeric name).`);
    } else {
      console.log("No garbage users found.");
    }

  } catch (e) {
    console.error("Error during cleanup:", e);
  }
}

cleanup().finally(() => prisma.$disconnect());
