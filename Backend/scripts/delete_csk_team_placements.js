/**
 * Deletes all placements and summary data for users in the CSK team only.
 * Use this to clear data before re-uploading new sheets.
 *
 * Run from Backend: node scripts/delete_csk_team_placements.js
 */

import prisma from "../src/prisma.js";

const TEAM_NAME = "csk"; // case-insensitive match

async function main() {
  console.log(`Finding team matching "${TEAM_NAME}"...`);
  const team = await prisma.team.findFirst({
    where: { name: { equals: TEAM_NAME, mode: "insensitive" } },
    include: { employees: { select: { id: true } } },
  });

  if (!team) {
    console.error(`Team not found with name matching "${TEAM_NAME}". Check team name in DB.`);
    process.exit(1);
  }

  const userIds = team.employees.map((e) => e.id);
  console.log(`Team "${team.name}" has ${userIds.length} member(s). User IDs: ${userIds.join(", ")}`);

  if (userIds.length === 0) {
    console.log("No members in team. Nothing to delete.");
    return;
  }

  // PersonalPlacement (includes summary rows with plcId SUMMARY-* etc.)
  const personalDeleted = await prisma.personalPlacement.deleteMany({
    where: { employeeId: { in: userIds } },
  });
  console.log(`Deleted ${personalDeleted.count} PersonalPlacement(s) (incl. summary rows)`);

  // 3. TeamPlacement (as lead – team sheet data for leads in CSK)
  const teamDeleted = await prisma.teamPlacement.deleteMany({
    where: { leadId: { in: userIds } },
  });
  console.log(`Deleted ${teamDeleted.count} TeamPlacement(s) (incl. summary rows)`);

  // 4. Optional: reset summary fields on EmployeeProfile for CSK members so dashboard doesn’t show stale targets
  const profilesUpdated = await prisma.employeeProfile.updateMany({
    where: { id: { in: userIds } },
    data: {
      placementsDone: null,
      totalRevenue: null,
      revenueAch: null,
      revenueTargetAchievedPercent: null,
      slabQualified: null,
      totalIncentiveAmount: null,
      totalIncentivePaid: null,
      targetAchievementStatus: null,
    },
  });
  console.log(`Reset summary fields on ${profilesUpdated.count} EmployeeProfile(s)`);

  console.log("\nDone. You can now re-upload the new personal and team sheets for CSK.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
