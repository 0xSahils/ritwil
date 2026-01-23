
import prisma from '../src/prisma.js';

async function findUser() {
  const user = await prisma.user.findFirst({
    where: { name: { contains: 'Umar', mode: 'insensitive' } }
  });
  console.log("Found User:", user);
  await prisma.$disconnect();
}

findUser().catch(console.error);
