
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const teams = await prisma.team.findMany();
  console.log("Teams:", teams.map(t => t.name));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
