
import prisma from '../src/prisma.js';

async function listUsers() {
  const profiles = await prisma.employeeProfile.findMany({
    take: 20,
    include: { user: true }
  });

  console.log("Sample Employee Profiles:");
  profiles.forEach(p => {
    console.log(`User: ${p.user.name}, VBID: ${p.vbid}, ID: ${p.user.id}`);
  });
  
  await prisma.$disconnect();
}

listUsers().catch(console.error);
