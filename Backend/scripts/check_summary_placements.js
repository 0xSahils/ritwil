/**
 * Diagnostic: Check PersonalPlacement summary rows and that employeeId matches User.id.
 * Run from Backend: node scripts/check_summary_placements.js
 */
import prisma from '../src/prisma.js';

async function main() {
  const summaryRows = await prisma.personalPlacement.findMany({
    where: { plcId: { startsWith: 'SUMMARY-' } },
    select: { id: true, employeeId: true, plcId: true, placementDone: true, candidateName: true },
  });
  console.log(`Found ${summaryRows.length} SUMMARY rows in PersonalPlacement\n`);

  for (const row of summaryRows.slice(0, 20)) {
    const user = await prisma.user.findUnique({
      where: { id: row.employeeId },
      select: { id: true, name: true, role: true },
    });
    const profile = await prisma.employeeProfile.findUnique({
      where: { id: row.employeeId },
      select: { id: true },
    });
    console.log(
      `  employeeId=${row.employeeId} placementDone=${row.placementDone} user=${user?.name ?? 'NOT FOUND'} profile.id=${profile?.id ?? 'N/A'}`
    );
  }
  if (summaryRows.length > 20) console.log(`  ... and ${summaryRows.length - 20} more\n`);

  const harinath = await prisma.user.findFirst({
    where: { name: { contains: 'Harinath', mode: 'insensitive' } },
    select: { id: true, name: true },
  });
  if (harinath) {
    const summary = await prisma.personalPlacement.findFirst({
      where: { employeeId: harinath.id, plcId: { startsWith: 'SUMMARY-' } },
      select: { placementDone: true, plcId: true },
    });
    console.log(`\nM Harinath: userId=${harinath.id} summary row placementDone=${summary?.placementDone ?? 'NO SUMMARY ROW'}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
