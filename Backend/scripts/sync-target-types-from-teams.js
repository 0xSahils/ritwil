/**
 * Sync targetType in EmployeeProfile table from team name:
 * - Vantage (team name contains "vant") → REVENUE
 * - All other teams → PLACEMENTS
 *
 * Run from Backend: node scripts/sync-target-types-from-teams.js
 * Or: npm run sync-target-types
 */
import 'dotenv/config';
import prisma from '../src/prisma.js';

async function syncTargetTypesFromTeams() {
  console.log('Syncing EmployeeProfile.targetType from team names...\n');

  const teams = await prisma.team.findMany({
    select: { id: true, name: true },
  });

  let totalUpdated = 0;

  for (const team of teams) {
    const targetType = team.name.toLowerCase().includes('vant') ? 'REVENUE' : 'PLACEMENTS';
    const result = await prisma.employeeProfile.updateMany({
      where: { teamId: team.id },
      data: { targetType },
    });
    if (result.count > 0) {
      console.log(`  ${team.name}: set targetType=${targetType} for ${result.count} member(s)`);
      totalUpdated += result.count;
    }
  }

  // Profiles with no team (teamId null) – leave unchanged; optional: set to PLACEMENTS
  const noTeam = await prisma.employeeProfile.count({ where: { teamId: null } });
  if (noTeam > 0) {
    console.log(`  (No team): ${noTeam} profile(s) – left unchanged`);
  }

  console.log('\nDone. Total profiles updated:', totalUpdated);
}

syncTargetTypesFromTeams()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
