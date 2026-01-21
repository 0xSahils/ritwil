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
    console.log(`Generating ${numPlacements} placements for ${userName}`);
    
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

const teamHierarchy = {
  superUser: {
    name: "Alok Mishra",
    email: "alok@gmail.com",
  },
  teams: [
    {
      id: "vantedge",
      name: "Vantedge",
      color: "blue",
      teamLeads: [
        {
          email: "raunak@gmail.com",
          name: "Raunak Tripathi",
          level: "L2",
          target: 125000,
          members: [
            { email: "ankit.maurya@gmail.com", name: "Ankit Maurya", level: "L4", target: 8000, pct: 85 },
            { email: "prithvi@gmail.com", name: "Prithvi Singh", level: "L4", target: 7000, pct: 90 },
            { email: "ranjeet@gmail.com", name: "Ranjeet Kumar", level: "L4", target: 6500, pct: 82 },
            { email: "devansh@gmail.com", name: "Devansh Mishra", level: "L4", target: 7500, pct: 88 },
            { email: "prachi.pandey@gmail.com", name: "Prachi Pandey", level: "L4", target: 8500, pct: 92 },
            { email: "pulkit@gmail.com", name: "Pulkit prakash", level: "L4", target: 7200, pct: 80 },
          ],
        },
        {
          email: "mayank@gmail.com",
          name: "Mayank Saxena",
          level: "L2",
          target: 120000,
          members: [
            { email: "govind@example.com", name: "Govind Srivastava", level: "L4", target: 10000, pct: 85 },
            { email: "umang@example.com", name: "Umang Srivastava", level: "L4", target: 10000, pct: 79 },
          ],
        },
        {
          email: "anshul@gmail.com",
          name: "Anshul Kumar",
          level: "L2",
          target: 124000,
          members: [
            { email: "priyansh@example.com", name: "Priyansh Khare", level: "L4", target: 6000, pct: 95 },
            { email: "shreya@example.com", name: "Shreya Singh", level: "L4", target: 6000, pct: 92 },
            { email: "abhishek@example.com", name: "Abhishek Srivastava", level: "L4", target: 6000, pct: 88 },
            { email: "smriti@example.com", name: "Smriti Jha", level: "L4", target: 6000, pct: 85 },
            { email: "anamika@example.com", name: "Anamika Dwivedi", level: "L4", target: 6000, pct: 85 },
          ],
        },
        {
          email: "umar@gmail.com",
          name: "Umar Mujahid Husain",
          level: "L2",
          target: 126000,
          members: [
            { email: "syed@example.com", name: "Syed Zaidi", level: "L4", target: 6500, pct: 88 },
            { email: "abhay@example.com", name: "Abhay Pratap Singh", level: "L4", target: 6500, pct: 82 },
            { email: "astha@example.com", name: "Astha Srivastava", level: "L4", target: 6500, pct: 85 },
          ],
        },
        {
          email: "rohini@gmail.com",
          name: "Rohini Parihar",
          level: "L2",
          target: 125000,
          members: [
            { email: "qausain@example.com", name: "Qausain Abbass", level: "L4", target: 6250, pct: 82 },
            { email: "anam.hasan@example.com", name: "Anam Hasan", level: "L4", target: 6250, pct: 78 },
            { email: "tanya@example.com", name: "Tanya Mishra", level: "L4", target: 6250, pct: 80 },
            { email: "devashish@example.com", name: "Devashish Sinha", level: "L4", target: 6250, pct: 80 },
          ],
        },
      ],
    },
    {
      id: "pioneer-lucky",
      name: "Pioneer - Lucky",
      color: "orange",
      teamLeads: [
        {
          email: "lucky@gmail.com",
          name: "Lucky Jain",
          level: "L2",
          target: 180000,
          members: [
            { email: "abhishek.rajpoot@example.com", name: "Abhishek Rajpoot", level: "L4", target: 13000, pct: 75 },
            { email: "pragati@example.com", name: "Pragati Mishra", level: "L4", target: 13000, pct: 70 },
            { email: "rishabh@example.com", name: "Rishabh Singh", level: "L4", target: 13000, pct: 72 },
            { email: "prachi.verma@example.com", name: "Prachi Verma", level: "L4", target: 13000, pct: 74 },
            { email: "ansh.rathore@example.com", name: "Ansh Singh Rathore", level: "L4", target: 14000, pct: 70 },
            { email: "vinay@example.com", name: "Vinay Kumar Pandey", level: "L4", target: 14000, pct: 73 },
          ],
        },
      ],
    },
    {
      id: "pioneer-rpo",
      name: "Pioneer - RPO",
      color: "purple",
      teamLeads: [
        {
          email: "ankit.pandey@gmail.com",
          name: "Ankit Pandey",
          level: "L2",
          target: 160000,
          members: [
            { email: "prachi.g@example.com", name: "Prachi Gupta", level: "L4", target: 6500, pct: 95 },
            { email: "shubham@example.com", name: "Shubham Rastogi", level: "L4", target: 6500, pct: 90 },
            { email: "priyanka@example.com", name: "Priyanka Mishra", level: "L4", target: 6500, pct: 92 },
            { email: "sagar@example.com", name: "Sagar Chandani", level: "L4", target: 6500, pct: 88 },
            { email: "bishore@example.com", name: "Bishore Bhattacharya", level: "L4", target: 6500, pct: 93 },
            { email: "vanshika@example.com", name: "Vanshika Srivastava", level: "L4", target: 6500, pct: 91 },
            { email: "sudhir@example.com", name: "Sudhir Kumar", level: "L4", target: 6500, pct: 94 },
            { email: "rishabh.two@example.com", name: "Rishabh Singh 2", level: "L4", target: 6500, pct: 90 },
            { email: "aman@example.com", name: "Aman Ayubi", level: "L4", target: 6500, pct: 92 },
          ],
        },
      ],
    },
    {
      id: "csk",
      name: "CSK",
      color: "green",
      teamLeads: [
        {
          email: "vinoth@gmail.com",
          name: "Vinoth L",
          level: "L2",
          target: 130000,
          members: [
            { email: "harinath@gmail.com", name: "M Harinath", level: "L3", target: 13000, pct: 88 },
            { email: "richardson@example.com", name: "R Richardson Richardson", level: "L4", target: 13000, pct: 88 },
            { email: "amaanullah@example.com", name: "A Mohamed Amaanullah Baig", level: "L4", target: 13000, pct: 85 },
            { email: "dinesh@example.com", name: "Dinesh Veluchamy", level: "L4", target: 14000, pct: 88 },
            { email: "gayathri@example.com", name: "J Gayathri", level: "L4", target: 4125, pct: 80 },
            { email: "sriram@example.com", name: "Sriram Arasu", level: "L4", target: 4125, pct: 78 },
            { email: "thomas@example.com", name: "Thomas J", level: "L4", target: 4125, pct: 76 },
            { email: "priyanga@example.com", name: "Priyanga Selvarasu", level: "L4", target: 4125, pct: 77 },
          ],
        },
        {
          email: "akbar@gmail.com",
          name: "Akbar Ibrahim",
          level: "L2",
          target: 132000,
          members: [
            { email: "ajith@gmail.com", name: "Ajith Gunasekar", level: "L3", target: 13000, pct: 78 },
            { email: "kishore@example.com", name: "Kishore Gopi", level: "L4", target: 6400, pct: 82 },
            { email: "ramanan@example.com", name: "Ramanan K", level: "L4", target: 6400, pct: 80 },
            { email: "rohini.l@example.com", name: "Rohini L", level: "L4", target: 6400, pct: 78 },
            { email: "sophia@example.com", name: "Sophia R", level: "L4", target: 6400, pct: 81 },
            { email: "dhivakar@example.com", name: "Dhivakar B", level: "L4", target: 6400, pct: 79 },
            { email: "jagan@example.com", name: "Jagan Prabhu Vedhagiri", level: "L4", target: 4125, pct: 79 },
            { email: "lokesh@example.com", name: "Lokesh R", level: "L4", target: 4125, pct: 78 },
            { email: "dasive@example.com", name: "Dasive Prakash S", level: "L4", target: 4125, pct: 80 },
            { email: "rubini@example.com", name: "Rubini Mohan", level: "L4", target: 4125, pct: 76 },
          ],
        },
      ],
    },
  ],
};

async function main() {
  await prisma.monthlyBilling.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.dailyEntry.deleteMany();
  await prisma.incentive.deleteMany();
  await prisma.campaignTask.deleteMany();
  await prisma.campaignAssignment.deleteMany();
  await prisma.campaignTeamLead.deleteMany();
  await prisma.campaignImage.deleteMany();
  await prisma.campaignActivity.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.monthlyBilling.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.dailyEntry.deleteMany();
  await prisma.incentive.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.campaignTask.deleteMany();
  await prisma.campaignActivity.deleteMany();
  await prisma.campaignAssignment.deleteMany();
  await prisma.campaignTeamLead.deleteMany();
  await prisma.campaignImage.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  const passwordHash = await bcrypt.hash(password, 10);
  
  const customData = getHierarchyData();
  
  if (customData && customData.hierarchy) {
    console.log("Seeding from hierarchy_data.json...");
    
    // Filter to seed Alok Mishra, Bhanu Pratap Singh, and Mohammad Fakhrul
    customData.hierarchy = customData.hierarchy.filter(h => h.name === "Alok Mishra" || h.name === "Bhanu Pratap Singh" || h.name === "Mohammad Fakhrul");
    console.log("Filtered hierarchy to include Alok Mishra, Bhanu Pratap Singh, and Mohammad Fakhrul.");

    // Create S1 Admin
    await prisma.user.create({
        data: {
            email: "admin@vbeyond.com",
            name: "S1 Admin",
            passwordHash,
            role: "S1_ADMIN",
        }
    });

    for (const l1 of customData.hierarchy) {
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
    console.log("Custom hierarchy seeded successfully.");
    return;
  }

  // Fallback Logic
  console.log("Seeding from default teamHierarchy...");
  
  const superAdmin = await prisma.user.create({
    data: {
      email: teamHierarchy.superUser.email,
      name: teamHierarchy.superUser.name,
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  // Create S1 Admin
  await prisma.user.create({
      data: {
          email: "admin@ritwil.com",
          name: "S1 Admin",
          passwordHash,
          role: "S1_ADMIN",
      }
  });

  for (const teamData of teamHierarchy.teams) {
    const team = await prisma.team.create({
      data: {
        id: teamData.id,
        name: teamData.name,
        color: teamData.color,
        yearlyTarget: 0,
      },
    });

    for (const leadData of teamData.teamLeads) {
      const leadUser = await prisma.user.create({
        data: {
          email: leadData.email,
          name: leadData.name,
          passwordHash,
          role: Role.TEAM_LEAD,
        },
      });

      await prisma.employeeProfile.create({
        data: {
          id: leadUser.id,
          teamId: team.id,
          managerId: null,
          level: leadData.level,
          yearlyTarget: leadData.target,
        },
      });

      if (leadData.members) {
        for (const memberData of leadData.members) {
          const memberUser = await prisma.user.create({
            data: {
              email: memberData.email,
              name: memberData.name,
              passwordHash,
              role: Role.EMPLOYEE,
            },
          });

          await prisma.employeeProfile.create({
            data: {
              id: memberUser.id,
              teamId: team.id,
              managerId: leadUser.id,
              level: memberData.level,
              yearlyTarget: memberData.target,
            },
          });

          const revenue = (memberData.target * (memberData.pct || 70)) / 100;

          await prisma.dailyEntry.create({
            data: {
              employeeId: memberUser.id,
              date: new Date(),
              clientName: "Seed Client",
              placementType: PlacementType.PERMANENT,
              revenue,
              marginPercent: 25,
              billingStatus: BillingStatus.BILLED,
              doi: new Date(),
              doj: new Date(),
              remarks: "Seed entry",
            },
          });
          
          const incentiveAmountUsd = revenue * 0.1;
          const incentiveAmountInr = incentiveAmountUsd * 80;

          await prisma.incentive.create({
            data: {
              employeeId: memberUser.id,
              periodStart: new Date(new Date().getFullYear(), 0, 1),
              periodEnd: new Date(new Date().getFullYear(), 11, 31),
              revenueTotal: revenue,
              slabName: "Slab1",
              amountUsd: incentiveAmountUsd,
              amountInr: incentiveAmountInr,
            },
          });

          const placement = await prisma.placement.create({
            data: {
              employeeId: memberUser.id,
              candidateName: memberUser.name,
              clientName: "Seed Client",
              doi: new Date("2024-01-15"),
              doj: new Date("2024-01-20"),
              daysCompleted: 245,
              placementType: PlacementType.PERMANENT,
              billedHours: 160,
              marginPercent: 25,
              revenue,
              billingStatus: BillingStatus.BILLED,
              incentivePayoutEta: new Date("2024-02-15"),
              incentiveAmountInr: incentiveAmountInr,
              incentivePaid: true,
              qualifier: true,
            },
          });

          await prisma.monthlyBilling.createMany({
            data: [
              {
                placementId: placement.id,
                month: "February 2024",
                hours: 40,
                status: BillingStatus.BILLED,
              },
              {
                placementId: placement.id,
                month: "March 2024",
                hours: 40,
                status: BillingStatus.BILLED,
              },
              {
                placementId: placement.id,
                month: "April 2024",
                hours: 40,
                status: BillingStatus.PENDING,
              },
            ],
          });
        }
      }

      // Fallback: Handle SubLeads (L3)
      if (leadData.subLeads) {
        for (const l3 of leadData.subLeads) {
          const l3User = await prisma.user.create({
            data: {
              email: l3.email,
              name: l3.name,
              passwordHash,
              role: Role.TEAM_LEAD,
            },
          });

          await prisma.employeeProfile.create({
            data: {
              id: l3User.id,
              teamId: team.id,
              managerId: leadUser.id,
              level: l3.level || "L3",
              yearlyTarget: l3.target || 50000,
            },
          });
          
          // Recursively create members for L3
          if (l3.members) {
            for (const memberData of l3.members) {
                const memberUser = await prisma.user.create({
                  data: {
                    email: memberData.email,
                    name: memberData.name,
                    passwordHash,
                    role: Role.EMPLOYEE,
                  },
                });

                await prisma.employeeProfile.create({
                  data: {
                    id: memberUser.id,
                    teamId: team.id,
                    managerId: l3User.id,
                    level: memberData.level,
                    yearlyTarget: memberData.target,
                  },
                });
                
                // Add revenue data for L4s under L3... (Simplified for fallback)
                const revenue = (memberData.target * (memberData.pct || 70)) / 100;
                await prisma.dailyEntry.create({
                    data: {
                        employeeId: memberUser.id,
                        date: new Date(),
                        clientName: "Seed Client",
                        placementType: PlacementType.PERMANENT,
                        revenue,
                        marginPercent: 25,
                        billingStatus: BillingStatus.BILLED,
                        doi: new Date(),
                        doj: new Date(),
                        remarks: "Seed entry",
                    },
                });
            }
          }
        }
      }
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
