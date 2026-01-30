
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function randomizeClientIds() {
    console.log("Starting Client ID Randomization...");
    
    const placements = await prisma.placement.findMany({
        select: { id: true, clientId: true }
    });
    
    console.log(`Found ${placements.length} placements.`);
    
    let updatedCount = 0;
    
    for (const p of placements) {
        // Generate random 3-digit number (100-999)
        const randomId = Math.floor(Math.random() * 900) + 100;
        
        await prisma.placement.update({
            where: { id: p.id },
            data: { clientId: String(randomId) }
        });
        
        updatedCount++;
        if (updatedCount % 50 === 0) process.stdout.write('.');
    }
    
    console.log(`\nUpdated ${updatedCount} placements with random 3-digit Client IDs.`);
}

randomizeClientIds()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
