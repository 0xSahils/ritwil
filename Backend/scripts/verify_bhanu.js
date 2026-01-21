import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alok = await prisma.user.findUnique({
    where: { email: "alok.mishra@vbeyond.com" },
    include: {
      employeeProfile: true,
      subordinates: {
        include: {
            employeeProfile: true,
            subordinates: {
                include: {
                    employeeProfile: true
                }
            }
        }
      }
    }
  });

  const bhanu = await prisma.user.findUnique({
    where: { email: "bhanu.singh@vbeyond.com" },
    include: {
      employeeProfile: true,
      subordinates: {
        include: {
            employeeProfile: true,
            subordinates: {
                include: {
                    employeeProfile: true
                }
            }
        }
      }
    }
  });

  console.log("--- Comparison ---");
  console.log("User: Alok Mishra");
  if (alok) {
      console.log(`Role: ${alok.role}`);
      console.log(`Level: ${alok.employeeProfile?.level}`);
      console.log(`Direct Subordinates (L2 Leads): ${alok.subordinates.length}`);
      
      let totalMembers = 0;
      for(const sub of alok.subordinates) {
          totalMembers += sub.subordinates.length;
      }
      console.log(`Indirect Subordinates (L3/L4 via L2): ${totalMembers}`);
  } else {
      console.log("Not found.");
  }

  console.log("\nUser: Bhanu Pratap Singh");
  if (bhanu) {
      console.log(`Role: ${bhanu.role}`);
      console.log(`Level: ${bhanu.employeeProfile?.level}`);
      console.log(`Direct Subordinates (L2 Leads): ${bhanu.subordinates.length}`);
      
      let totalMembers = 0;
      for(const sub of bhanu.subordinates) {
          totalMembers += sub.subordinates.length;
      }
      console.log(`Indirect Subordinates (L3/L4 via L2): ${totalMembers}`);
  } else {
      console.log("Not found.");
  }

  // Verify Placements exist for Bhanu's team
  if (bhanu && bhanu.subordinates.length > 0) {
      const firstLead = bhanu.subordinates[0];
      if (firstLead.subordinates.length > 0) {
          const firstMember = firstLead.subordinates[0];
          const placements = await prisma.placement.findMany({ where: { employeeId: firstMember.id } });
          console.log(`\nSample Member (${firstMember.name}) Placements: ${placements.length}`);
      }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
