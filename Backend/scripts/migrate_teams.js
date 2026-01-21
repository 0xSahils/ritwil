
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration: Restructuring Team Pioneer...");

  // 1. Find the old team
  const oldTeamName = "Team Pioneer"; // Or whatever it was called
  // Also check if there are other variations or if it's already done
  
  // We will look for "Pioneer - Lucky" and "Pioneer - RPO" (Pro)
  const newTeams = [
    { name: "Pioneer - Lucky", color: "orange", leadEmail: "lucky.jain@vbeyond.com" },
    { name: "Pioneer - RPO", color: "purple", leadEmail: "ankit.pandey@vbeyond.com" } // Assuming RPO is the Pro team based on JSON
  ];

  // Create new teams if they don't exist
  for (const t of newTeams) {
    let team = await prisma.team.findUnique({ where: { name: t.name } });
    if (!team) {
      console.log(`Creating team: ${t.name}`);
      team = await prisma.team.create({
        data: {
          name: t.name,
          color: t.color,
          yearlyTarget: 0
        }
      });
    } else {
        console.log(`Team ${t.name} already exists.`);
    }

    // Find the lead
    const lead = await prisma.user.findUnique({ where: { email: t.leadEmail } });
    if (lead) {
        // Update lead's team
        await prisma.employeeProfile.update({
            where: { id: lead.id },
            data: { teamId: team.id }
        });
        console.log(`Updated lead ${lead.name} to team ${t.name}`);

        // Update lead's direct reports to this team
        const reports = await prisma.user.findMany({
            where: { managerId: lead.id }
        });
        
        for (const report of reports) {
            await prisma.employeeProfile.update({
                where: { id: report.id },
                data: { teamId: team.id }
            });
             console.log(`Updated member ${report.name} to team ${t.name}`);
        }
    } else {
        console.log(`Lead ${t.leadEmail} not found!`);
    }
  }

  // cleanup old team if empty
  const oldTeam = await prisma.team.findUnique({ where: { name: "Team Pioneer" } }); // Try exact name
  if (oldTeam) {
      const remainingMembers = await prisma.employeeProfile.count({ where: { teamId: oldTeam.id } });
      if (remainingMembers === 0) {
          console.log("Deleting empty old team: Team Pioneer");
          await prisma.team.delete({ where: { id: oldTeam.id } });
      } else {
          console.log(`Old team still has ${remainingMembers} members. Manual check required.`);
      }
  }

  // Also check for "Pioneer"
  const oldTeam2 = await prisma.team.findUnique({ where: { name: "Pioneer" } });
  if (oldTeam2) {
      const remainingMembers = await prisma.employeeProfile.count({ where: { teamId: oldTeam2.id } });
      if (remainingMembers === 0) {
          console.log("Deleting empty old team: Pioneer");
          await prisma.team.delete({ where: { id: oldTeam2.id } });
      }
  }

  console.log("Migration completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
