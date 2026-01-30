import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkMickael() {
  try {
    const placements = await prisma.placement.findMany({
      where: {
        candidateName: {
          contains: 'Mickael',
        },
      },
      include: {
        employee: true,
      }
    });

    console.log('Found placements:', JSON.stringify(placements, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMickael();
