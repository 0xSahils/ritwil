import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Removing unique constraints on plcId...');
  
  try {
    // Remove unique constraint on PersonalPlacement.plcId
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "PersonalPlacement" DROP CONSTRAINT IF EXISTS "PersonalPlacement_plcId_key";
    `);
    console.log('✓ Removed unique constraint from PersonalPlacement.plcId');
    
    // Remove unique constraint on TeamPlacement.plcId
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "TeamPlacement" DROP CONSTRAINT IF EXISTS "TeamPlacement_plcId_key";
    `);
    console.log('✓ Removed unique constraint from TeamPlacement.plcId');
    
    // Add indexes (if they don't exist)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PersonalPlacement_plcId_idx" ON "PersonalPlacement"("plcId");
    `);
    console.log('✓ Added index on PersonalPlacement.plcId');
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "TeamPlacement_plcId_idx" ON "TeamPlacement"("plcId");
    `);
    console.log('✓ Added index on TeamPlacement.plcId');
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
