import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkOrphans() {
  try {
    console.log('Checking for orphaned MonthlyBilling records...');
    
    // Find all MonthlyBilling records
    const billings = await prisma.monthlyBilling.findMany({
      select: {
        id: true,
        placementId: true
      }
    });

    console.log(`Found ${billings.length} MonthlyBilling records.`);

    // Find all valid Placement IDs
    const placements = await prisma.placement.findMany({
      select: { id: true }
    });
    const placementIds = new Set(placements.map(p => p.id));

    // Check which ones point to non-existent placements
    const orphanedBillings = billings
      .filter(b => !placementIds.has(b.placementId))
      .map(b => b.id);

    console.log(`Found ${orphanedBillings.length} orphaned MonthlyBilling records.`);

    if (orphanedBillings.length > 0) {
      console.log('Deleting orphaned MonthlyBilling records...');
      const deleteResult = await prisma.monthlyBilling.deleteMany({
        where: {
          id: {
            in: orphanedBillings
          }
        }
      });
      console.log(`Deleted ${deleteResult.count} orphaned MonthlyBilling records.`);
    } else {
      console.log('No orphaned MonthlyBilling records found.');
    }
    
  } catch (error) {
    console.error('Error checking orphans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrphans();
