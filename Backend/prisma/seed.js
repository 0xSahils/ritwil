import { PrismaClient, Role, PlacementType, BillingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const password = "123";

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
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  const passwordHash = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: teamHierarchy.superUser.email,
      name: teamHierarchy.superUser.name,
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
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

        const revenue = (memberData.target * memberData.pct) / 100;

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
  }

  const allTeamLeads = await prisma.user.findMany({
    where: { role: Role.TEAM_LEAD },
  });

  const allEmployees = await prisma.user.findMany({
    where: { role: Role.EMPLOYEE },
    take: 20,
  });

  if (allTeamLeads.length > 0 && allEmployees.length > 0) {
    const campaign = await prisma.campaign.create({
      data: {
        name: "Q1 Growth Campaign",
        description: "Drive incremental placements and revenue in Q1.",
        objective: "Increase total revenue by 15% across key teams.",
        status: "ACTIVE",
        targetAmount: 500000,
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date(new Date().getFullYear(), 2, 31),
        createdById: superAdmin.id,
      },
    });

    await prisma.campaignTeamLead.createMany({
      data: allTeamLeads.slice(0, 3).map((lead) => ({
        campaignId: campaign.id,
        userId: lead.id,
      })),
    });

    const perEmployeeTarget =
      500000 / allEmployees.length;

    await prisma.campaignAssignment.createMany({
      data: allEmployees.map((emp) => ({
        campaignId: campaign.id,
        userId: emp.id,
        role: Role.EMPLOYEE,
        targetAmount: perEmployeeTarget,
      })),
    });
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

