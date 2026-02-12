import prisma from './src/prisma.js';

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'EmployeeProfile' AND column_name = 'individualSynopsis'
    `;
    console.log('Column check result:', JSON.stringify(result, null, 2));
    
    if (result.length === 0) {
      console.log('individualSynopsis column is MISSING in EmployeeProfile table.');
    } else {
      console.log('individualSynopsis column EXISTS in EmployeeProfile table.');
    }
  } catch (error) {
    console.error('Error checking column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
