
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findVantageTeam() {
  try {
    // Check for Vantedge (spelling variation)
    const teams = await prisma.team.findMany({
      where: {
        OR: [
            { name: { contains: 'Vantage', mode: 'insensitive' } },
            { name: { contains: 'Vantedge', mode: 'insensitive' } }
        ]
      },
      include: {
        employees: {
          include: {
            user: {
              include: {
                placements: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    console.log(`Found ${teams.length} teams matching 'Vantage' or 'Vantedge':`);
    teams.forEach(t => {
      console.log(`Team: ${t.name} (ID: ${t.id})`);
      t.employees.forEach(e => {
        console.log(`    - ${e.user.name} (${e.user.role}) [Level: ${e.level}] - Placements: ${e.user.placements.length}`);
      });
    });

    // Check for Umar specifically
    const umar = await prisma.user.findFirst({
        where: { name: { contains: 'Umar', mode: 'insensitive' } },
        include: { employeeProfile: { include: { team: true } } }
    });
    
    if (umar) {
        console.log(`\nUser 'Umar' found: ${umar.name} (ID: ${umar.id})`);
        if (umar.employeeProfile?.team) {
            console.log(`  Team: ${umar.employeeProfile.team.name} (ID: ${umar.employeeProfile.team.id})`);
        } else {
            console.log(`  No team assigned.`);
        }
    } else {
        console.log("\nUser 'Umar' not found via search.");
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

findVantageTeam();
