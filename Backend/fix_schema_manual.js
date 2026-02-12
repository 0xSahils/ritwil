import prisma from './src/prisma.js';

async function main() {
  const columnsToDrop = [
    'yearlyRevenueTarget',
    'revenueAch',
    'revenueTargetAchievedPercent'
  ];

  console.log('--- Cleaning up PersonalPlacement table ---');
  
  for (const column of columnsToDrop) {
    try {
      // Check if column exists
      const checkResult = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'PersonalPlacement' AND column_name = ${column}
      `;

      if (checkResult.length > 0) {
        console.log(`Dropping column ${column} from PersonalPlacement...`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "PersonalPlacement" DROP COLUMN "${column}"`);
        console.log(`Successfully dropped ${column}.`);
      } else {
        console.log(`Column ${column} does not exist in PersonalPlacement.`);
      }
    } catch (error) {
      console.error(`Error processing column ${column}:`, error.message);
    }
  }

  // Also verify the schema sync if possible
  try {
    console.log('\n--- Current columns in PersonalPlacement ---');
    const allColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'PersonalPlacement'
      ORDER BY ordinal_position
    `;
    console.log(allColumns.map(c => c.column_name).join(', '));
  } catch (error) {
    console.error('Error fetching columns:', error.message);
  }

  await prisma.$disconnect();
}

main();
