
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Renaming Team 'Pioneer - RPO' to 'Pioneer-Pro'...");
  
  try {
    const team = await prisma.team.findFirst({
      where: { name: 'Pioneer - RPO' }
    });

    if (team) {
      await prisma.team.update({
        where: { id: team.id },
        data: { name: 'Pioneer-Pro' }
      });
      console.log("Successfully renamed 'Pioneer - RPO' to 'Pioneer-Pro'");
    } else {
      console.log("Team 'Pioneer - RPO' not found. Checking if 'Pioneer-Pro' already exists...");
      const existing = await prisma.team.findUnique({
        where: { name: 'Pioneer-Pro' }
      });
      if (existing) {
        console.log("'Pioneer-Pro' already exists.");
      } else {
        console.log("Neither 'Pioneer - RPO' nor 'Pioneer-Pro' found. Please check database.");
      }
    }
  } catch (error) {
    console.error("Error updating team name:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
