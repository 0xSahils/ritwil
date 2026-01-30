import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupNullRevenue() {
  try {
    console.log('Fetching all placements...');
    const placements = await prisma.placement.findMany({
      include: {
        employee: true
      }
    });

    console.log(`Total placements: ${placements.length}`);

    // Group by Candidate + Client
    const groups = {};
    for (const p of placements) {
      const key = `${p.candidateName}|${p.clientName}`.toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }

    let deletedCount = 0;

    for (const key in groups) {
      const group = groups[key];
      if (group.length > 1) {
        // Sort by revenueAsLead (descending), so ones with value come first
        group.sort((a, b) => {
          const revA = Number(a.revenueAsLead || 0);
          const revB = Number(b.revenueAsLead || 0);
          return revB - revA;
        });

        const best = group[0];
        const bestRev = Number(best.revenueAsLead || 0);

        // If even the best one has no revenue, skip (or maybe delete duplicates anyway?)
        // Let's focus on the case where we have a valid one and invalid ones.
        if (bestRev > 0) {
          for (let i = 1; i < group.length; i++) {
            const current = group[i];
            const currentRev = Number(current.revenueAsLead || 0);

            if (currentRev === 0 || current.revenueAsLead === null) {
              console.log(`Deleting duplicate with no Revenue as Lead:`);
              console.log(`  Candidate: ${current.candidateName}`);
              console.log(`  Employee: ${current.employee.name} (${current.employee.role})`);
              console.log(`  ID: ${current.id}`);
              console.log(`  Kept ID: ${best.id} (Rev: ${bestRev}, Emp: ${best.employee.name})`);

              await prisma.placement.delete({
                where: { id: current.id }
              });
              deletedCount++;
            }
          }
        } else {
             // Ambiguous case: multiple entries, none have revenueAsLead.
             // Maybe check totalRevenue?
             // For now, let's just log them.
             console.log(`Ambiguous duplicates (No Revenue as Lead): ${key}`);
             group.forEach(p => console.log(`  - ${p.employee.name} (${p.employee.role}) - Rev: ${p.revenueAsLead}`));
        }
      }
    }

    console.log(`\nCleanup complete. Deleted ${deletedCount} placements.`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupNullRevenue();
