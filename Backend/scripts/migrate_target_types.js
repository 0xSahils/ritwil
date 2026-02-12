import prisma from '../src/prisma.js';

/**
 * Migration script to update targetType and yearlyTarget for all EmployeeProfiles:
 * - For Vantage teams: Keep REVENUE-based targets
 * - For all other teams: Convert to PLACEMENTS-based targets (yearlyPlacementTarget -> yearlyTarget)
 */
async function migrateTargetTypes() {
  try {
    console.log('Starting target type migration...');

    // Fetch all teams to identify Vantage teams
    const teams = await prisma.team.findMany({
      select: { id: true, name: true },
    });

    const vantageTeamIds = new Set();
    teams.forEach(team => {
      if (team.name.toLowerCase().includes('vant')) {
        vantageTeamIds.add(team.id);
        console.log(`Found Vantage team: ${team.name} (ID: ${team.id})`);
      }
    });

    // Fetch all employee profiles
    const profiles = await prisma.employeeProfile.findMany({
      include: {
        team: {
          select: { id: true, name: true },
        },
      },
    });

    console.log(`Found ${profiles.length} employee profiles to process`);

    let updatedVantage = 0;
    let updatedNonVantage = 0;
    let skipped = 0;

    for (const profile of profiles) {
      const teamId = profile.teamId;
      const isVantage = teamId && vantageTeamIds.has(teamId);
      const teamName = profile.team?.name || '';

      const updateData = {};

      if (isVantage) {
        // Vantage: Keep REVENUE-based targets
        // If yearlyTarget exists and is reasonable (not a placement count), keep it
        // Otherwise, if yearlyRevenueTarget exists, use that
        if (profile.yearlyRevenueTarget && profile.yearlyRevenueTarget > 0) {
          updateData.yearlyTarget = profile.yearlyRevenueTarget;
        }
        // If yearlyTarget is already set and looks like revenue (large number), keep it
        if (profile.yearlyTarget && profile.yearlyTarget > 1000) {
          // Likely revenue, keep as is
        } else if (profile.yearlyTarget && profile.yearlyTarget <= 100 && profile.yearlyRevenueTarget) {
          // Likely a placement count mistakenly in yearlyTarget, replace with revenue target
          updateData.yearlyTarget = profile.yearlyRevenueTarget;
        }
        updateData.targetType = 'REVENUE';
        updatedVantage++;
      } else {
        // Non-Vantage: Convert to PLACEMENTS-based targets
        if (profile.yearlyPlacementTarget && profile.yearlyPlacementTarget > 0) {
          updateData.yearlyTarget = profile.yearlyPlacementTarget;
          updateData.targetType = 'PLACEMENTS';
          updatedNonVantage++;
        } else if (profile.yearlyTarget && profile.yearlyTarget > 0 && profile.yearlyTarget <= 100) {
          // If yearlyTarget looks like a placement count (small number), set targetType to PLACEMENTS
          updateData.targetType = 'PLACEMENTS';
          updatedNonVantage++;
        } else {
          // No clear target data, skip
          skipped++;
          continue;
        }
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.employeeProfile.update({
          where: { id: profile.id },
          data: updateData,
        });
        console.log(
          `Updated ${profile.id} (${teamName || 'No Team'}): ` +
          `targetType=${updateData.targetType}, yearlyTarget=${updateData.yearlyTarget || profile.yearlyTarget}`
        );
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Vantage teams updated: ${updatedVantage}`);
    console.log(`Non-Vantage teams updated: ${updatedNonVantage}`);
    console.log(`Skipped (no clear target data): ${skipped}`);
    console.log(`Total processed: ${profiles.length}`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateTargetTypes()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
