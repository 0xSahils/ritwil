
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  const deleteResult = await prisma.placement.deleteMany({
    where: { candidateName: 'John Donaldson' }
  });
  console.log(`Deleted ${deleteResult.count} placements for John Donaldson`);
}

clean().finally(() => prisma.$disconnect());
