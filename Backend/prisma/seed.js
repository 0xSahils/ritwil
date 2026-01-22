import { PrismaClient, Role, PlacementType, BillingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const password = "123";

const CLIENT_NAMES = [
  "TechCorp Inc.", "Global Solutions", "Innovate Systems", "Alpha Dynamics", "Omega Partners",
  "BlueSky Ventures", "Quantum Leap", "Vertex Holdings", "Nexus Group", "Pinnacle Services",
  "Summit Technologies", "Horizon Digital", "Vanguard Corp", "Synergy Global", "Meridian Systems"
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateRandomDataForUser = async (userId, userName) => {
    // 95% chance to have data
    if (Math.random() > 0.95) return;

    const numPlacements = getRandomInt(3, 8);
    // console.log(`Generating ${numPlacements} placements for ${userName}`);
    
    for (let i = 0; i < numPlacements; i++) {
        const clientName = getRandomElement(CLIENT_NAMES);
        const revenue = getRandomInt(5000, 25000);
        const margin = getRandomInt(20, 35);
        const doi = getRandomDate(new Date('2024-01-01'), new Date('2024-05-30'));
        const doj = new Date(doi);
        doj.setDate(doj.getDate() + getRandomInt(5, 20));
        
        const placementType = Math.random() > 0.3 ? PlacementType.PERMANENT : PlacementType.CONTRACT;
        
        // Create Daily Entry
        await prisma.dailyEntry.create({
            data: {
                employeeId: userId,
                date: doi,
                clientName,
                placementType,
                revenue,
                marginPercent: margin,
                billingStatus: BillingStatus.BILLED,
                doi,
                doj,
                remarks: "Seeded entry",
            },
        });

        // Create Incentive
        const incentiveAmountUsd = revenue * 0.1;
        const incentiveAmountInr = incentiveAmountUsd * 83; // Approx rate

        await prisma.incentive.create({
            data: {
                employeeId: userId,
                periodStart: new Date(doi.getFullYear(), doi.getMonth(), 1),
                periodEnd: new Date(doi.getFullYear(), doi.getMonth() + 1, 0),
                revenueTotal: revenue,
                slabName: "Standard",
                amountUsd: incentiveAmountUsd,
                amountInr: incentiveAmountInr,
            },
        });

        // Create Placement
        const placement = await prisma.placement.create({
            data: {
                employeeId: userId,
                candidateName: `${userName} Candidate ${i+1}`,
                clientName,
                doi,
                doj,
                daysCompleted: getRandomInt(30, 180),
                placementType,
                billedHours: placementType === PlacementType.CONTRACT ? 160 : null,
                marginPercent: margin,
                revenue,
                billingStatus: BillingStatus.BILLED,
                incentivePayoutEta: new Date(doj.getTime() + 30 * 24 * 60 * 60 * 1000),
                incentiveAmountInr,
                incentivePaid: Math.random() > 0.5,
                qualifier: true,
            },
        });

        // Create Monthly Billing
        if (placementType === PlacementType.CONTRACT) {
            await prisma.monthlyBilling.createMany({
                data: [
                    {
                        placementId: placement.id,
                        month: "February 2024",
                        hours: 160,
                        status: BillingStatus.BILLED,
                    },
                    {
                        placementId: placement.id,
                        month: "March 2024",
                        hours: 168,
                        status: BillingStatus.BILLED,
                    }
                ]
            });
        }
    }
};

const getHierarchyData = () => {
  const dataPath = path.join(__dirname, "../hierarchy_data.json");
  if (fs.existsSync(dataPath)) {
    try {
      const rawData = fs.readFileSync(dataPath, "utf-8");
      return JSON.parse(rawData);
    } catch (e) {
      console.error("Error reading hierarchy_data.json:", e);
    }
  }
  return null;
};

// Function to delete an entire hierarchy tree starting from L1
const deleteHierarchy = async (l1Email, teamNames) => {
    console.log(`Attempting to delete hierarchy for ${l1Email}...`);
    
    // Find L1 User
    const l1User = await prisma.user.findUnique({ where: { email: l1Email } });
    if (!l1User) {
        console.log(`L1 User ${l1Email} not found. Skipping delete.`);
        
        // Even if user not found, try to delete teams to be safe
        if (teamNames && teamNames.length > 0) {
             await prisma.team.deleteMany({ where: { name: { in: teamNames } } });
        }
        return;
    }

    // Find all descendants (L2 -> L3 -> L4)
    // L2s
    const l2Users = await prisma.user.findMany({ where: { managerId: l1User.id } });
    const l2Ids = l2Users.map(u => u.id);
    
    // L3s
    let l3Ids = [];
    if (l2Ids.length > 0) {
        const l3Users = await prisma.user.findMany({ where: { managerId: { in: l2Ids } } });
        l3Ids = l3Users.map(u => u.id);
    }

    // L4s
    let l4Ids = [];
    if (l3Ids.length > 0) {
        const l4Users = await prisma.user.findMany({ where: { managerId: { in: l3Ids } } });
        l4Ids = l4Users.map(u => u.id);
    }

    // Collect all IDs to delete
    const allUserIds = [l1User.id, ...l2Ids, ...l3Ids, ...l4Ids];
    console.log(`Found ${allUserIds.length} users to delete in hierarchy.`);

    // Delete related data
    await prisma.monthlyBilling.deleteMany({ where: { placement: { employeeId: { in: allUserIds } } } });
    await prisma.placement.deleteMany({ where: { employeeId: { in: allUserIds } } });
    await prisma.dailyEntry.deleteMany({ where: { employeeId: { in: allUserIds } } });
    await prisma.incentive.deleteMany({ where: { employeeId: { in: allUserIds } } });
    await prisma.refreshToken.deleteMany({ where: { userId: { in: allUserIds } } });
    await prisma.auditLog.deleteMany({ where: { actorId: { in: allUserIds } } });
    await prisma.campaignTask.deleteMany({ where: { completedById: { in: allUserIds } } });
    await prisma.campaignActivity.deleteMany({ where: { userId: { in: allUserIds } } });
    await prisma.campaignAssignment.deleteMany({ where: { userId: { in: allUserIds } } });
    await prisma.campaignTeamLead.deleteMany({ where: { userId: { in: allUserIds } } });
    await prisma.campaignImage.deleteMany({ where: { uploadedById: { in: allUserIds } } });
    await prisma.campaign.deleteMany({ where: { createdById: { in: allUserIds } } });
    
    // Delete Profiles
    await prisma.employeeProfile.deleteMany({ where: { id: { in: allUserIds } } });
    
    // Delete Users
    await prisma.user.deleteMany({ where: { id: { in: allUserIds } } });
    
    // Delete Teams
    if (teamNames && teamNames.length > 0) {
        // Need to unlink any remaining profiles from these teams first (if any exists outside our hierarchy - shouldn't happen but safe to check)
        // Actually, if we delete the team, profiles pointing to it might fail if restrict. 
        // But we just deleted the profiles of this hierarchy.
        // Assuming no one else is in these teams.
        await prisma.team.deleteMany({ where: { name: { in: teamNames } } });
    }
    
    console.log(`Hierarchy for ${l1Email} deleted successfully.`);
};

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const customData = getHierarchyData();
  
  if (customData && customData.hierarchy) {
    console.log("Seeding from hierarchy_data.json...");
    
    // TARGET HIERARCHIES TO UPDATE
    const TARGET_NAMES = ["Mohammad Fakhrul", "Sidhartha Khosla", "Noor Beg"];
    
    // Filter the data
    const hierarchyToSeed = customData.hierarchy.filter(h => TARGET_NAMES.includes(h.name));
    console.log(`Filtered hierarchy to include: ${TARGET_NAMES.join(", ")}`);

    // Ensure S1 Admin exists
    const s1AdminEmail = "admin@vbeyond.com";
    const s1Admin = await prisma.user.findUnique({ where: { email: s1AdminEmail } });
    if (!s1Admin) {
         await prisma.user.create({
            data: {
                email: s1AdminEmail,
                name: "S1 Admin",
                passwordHash,
                role: "S1_ADMIN",
            }
        });
        console.log("S1 Admin created.");
    } else {
        console.log("S1 Admin already exists.");
    }

    for (const l1 of hierarchyToSeed) {
      // DELETE EXISTING HIERARCHY FIRST
      const teamNames = l1.teams ? l1.teams.map(t => t.name) : [];
      await deleteHierarchy(l1.email, teamNames);

      // CREATE NEW HIERARCHY
      console.log(`Creating hierarchy for ${l1.name}...`);
      const l1User = await prisma.user.create({
        data: {
          email: l1.email,
          name: l1.name,
          passwordHash,
          role: Role.SUPER_ADMIN,
          employeeProfile: {
             create: {
                 level: l1.level || "L1",
                 yearlyTarget: 0
             }
          }
        },
      });

      if (l1.teams) {
        for (const teamData of l1.teams) {
          // Check if team exists (it shouldn't if we deleted it, but maybe cross-linked?)
          let team = await prisma.team.findUnique({ where: { name: teamData.name } });
          if (!team) {
            team = await prisma.team.create({
              data: {
                name: teamData.name,
                color: teamData.color || "blue",
                yearlyTarget: 0,
              },
            });
          }

          if (teamData.leads) {
            for (const l2 of teamData.leads) {
              const l2User = await prisma.user.create({
                data: {
                  email: l2.email,
                  name: l2.name,
                  passwordHash,
                  role: Role.TEAM_LEAD,
                  managerId: l1User.id,
                  employeeProfile: {
                    create: {
                      teamId: team.id,
                      level: l2.level || "L2",
                      yearlyTarget: l2.target || 100000,
                      managerId: l1User.id,
                    }
                  }
                },
              });

              const createMembers = async (members, managerId) => {
                for (const member of members) {
                  const memberUser = await prisma.user.create({
                    data: {
                      email: member.email,
                      name: member.name,
                      passwordHash,
                      role: Role.EMPLOYEE,
                      managerId: managerId,
                      employeeProfile: {
                        create: {
                          teamId: team.id,
                          level: member.level || "L4",
                          yearlyTarget: member.target || 10000,
                          managerId: managerId,
                        }
                      }
                    },
                  });
                  await generateRandomDataForUser(memberUser.id, member.name);
                }
              };

              if (l2.members) {
                await createMembers(l2.members, l2User.id);
              }

              if (l2.subLeads) {
                for (const l3 of l2.subLeads) {
                  const l3User = await prisma.user.create({
                    data: {
                      email: l3.email,
                      name: l3.name,
                      passwordHash,
                      role: Role.TEAM_LEAD,
                      managerId: l2User.id,
                      employeeProfile: {
                        create: {
                          teamId: team.id,
                          level: l3.level || "L3",
                          yearlyTarget: l3.target || 50000,
                          managerId: l2User.id,
                        }
                      }
                    },
                  });
                  await generateRandomDataForUser(l3User.id, l3.name);

                  if (l3.members) {
                    await createMembers(l3.members, l3User.id);
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log("Custom hierarchy updated successfully.");
    return;
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
