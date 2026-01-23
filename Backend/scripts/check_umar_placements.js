
import prisma from '../src/prisma.js';

async function checkPlacement() {
  const user = await prisma.user.findFirst({
    where: { name: 'Umar Mujahid Husain' }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  const placements = await prisma.placement.findMany({
    where: { employeeId: user.id },
    take: 5
  });

  console.log("Placements for Umar:", placements);
  await prisma.$disconnect();
}

checkPlacement().catch(console.error);
