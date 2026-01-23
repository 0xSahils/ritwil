
import prisma from '../src/prisma.js';

async function check() {
    const users = await prisma.user.findMany({
        where: { name: { contains: 'Abhishek', mode: 'insensitive' } },
        include: { placements: true }
    });

    console.log(`Found ${users.length} users with 'Abhishek':`);
    users.forEach(u => {
        console.log(`- ${u.name} (Placements: ${u.placements.length})`);
    });
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
