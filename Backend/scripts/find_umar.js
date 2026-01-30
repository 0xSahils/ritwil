
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function find() {
  const users = await prisma.user.findMany({
    where: { name: { contains: 'Umar', mode: 'insensitive' } }
  });
  console.log(users);
}

find().finally(() => prisma.$disconnect());
