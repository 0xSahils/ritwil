
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function debugAlok() {
  try {
    console.log("Searching for Alok Mishra...");
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
            { email: "alok.mishra@vbeyond.com" },
            { name: "Alok Mishra" }
        ]
      },
      include: {
        employeeProfile: true
      }
    });

    if (!user) {
      console.log("User 'Alok Mishra' NOT FOUND in database.");
      return;
    }

    console.log("Found User:", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    // Check subordinates (L2s)
    const subordinates = await prisma.user.findMany({
      where: { managerId: user.id },
      include: {
        employeeProfile: {
            include: { team: true }
        }
      }
    });

    console.log(`Found ${subordinates.length} direct reports (L2s).`);
    
    if (subordinates.length > 0) {
        subordinates.forEach(sub => {
            console.log(`- ${sub.name} (${sub.role}): Team -> ${sub.employeeProfile?.team?.name || 'None'} (TeamID: ${sub.employeeProfile?.teamId})`);
        });
    } else {
        console.log("WARNING: Alok has no direct reports. This explains why no teams are showing.");
    }

    // Check if there are ANY teams
    const allTeams = await prisma.team.findMany();
    console.log(`Total teams in DB: ${allTeams.length}`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

debugAlok();
