
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findVantageTeam() {
  try {
    const teams = await prisma.team.findMany({
      where: {
        name: {
          contains: 'Vantage',
          mode: 'insensitive' // Use insensitive mode for PostgreSQL
        }
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

    console.log(`Found ${teams.length} teams matching 'Vantage':`);
    teams.forEach(t => {
      console.log(`Team: ${t.name} (ID: ${t.id})`);
      const l4Members = t.employees.filter(e => e.user.role === 'EMPLOYEE' || e.level === 'L4' || e.user.name.includes("L4")); 
      // Note: Role might be 'EMPLOYEE' for L4. Let's check user roles.
      
      console.log(`  Members: ${t.employees.length}`);
      t.employees.forEach(e => {
        console.log(`    - ${e.user.name} (${e.user.role}) - Placements: ${e.user.placements.length}`);
      });
    });

    // Also check for user "Umar Mujahid Husain" as he was in the Excel file as Recruiter
    const umar = await prisma.user.findFirst({
        where: { name: { contains: 'Umar', mode: 'insensitive' } },
        include: { employeeProfile: { include: { team: true } } }
    });
    
    if (umar) {
        console.log(`\nUser 'Umar' found: ${umar.name}, Role: ${umar.role}`);
        if (umar.employeeProfile?.team) {
            console.log(`  Team: ${umar.employeeProfile.team.name} (ID: ${umar.employeeProfile.team.id})`);
        } else {
            console.log(`  No team assigned.`);
        }
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

findVantageTeam();
