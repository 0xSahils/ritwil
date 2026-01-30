
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.placement.count();
  console.log(`Total Placements: ${count}`);

  const placements = await prisma.placement.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { employee: true }
  });

  console.log('Recent 5 Placements:');
  placements.forEach(p => {
      console.log(`- ${p.candidateName} (${p.clientName}) - Recruiter: ${p.employee?.name}`);
      console.log(`  L2 Fields: Sourcer=${p.sourcer}, AM=${p.accountManager}, TL=${p.teamLead}, Sharing=${p.placementSharing}`);
  });
}

check().finally(() => prisma.$disconnect());
