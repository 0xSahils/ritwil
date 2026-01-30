
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const placements = await prisma.placement.findMany({
    where: { candidateName: 'John Donaldson' },
    include: { employee: true }
  });
  console.log(JSON.stringify(placements, null, 2));
}

check().finally(() => prisma.$disconnect());
