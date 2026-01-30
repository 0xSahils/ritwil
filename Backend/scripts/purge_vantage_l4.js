
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function purgeVantageL4() {
  const log = [];
  try {
    console.log("Starting Vantage L4 Purge...");

    // 1. Identify Vantage Team
    const teams = await prisma.team.findMany({
      where: {
        OR: [
            { name: { contains: 'Vantage', mode: 'insensitive' } },
            { name: { contains: 'Vantedge', mode: 'insensitive' } }
        ]
      }
    });

    if (teams.length === 0) {
      console.error("No Vantage/Vantedge team found.");
      return;
    }
    const vantageTeamId = teams[0].id;
    console.log(`Found Team: ${teams[0].name} (${vantageTeamId})`);

    // 2. Identify L4 Employees in Vantage
    const l4Employees = await prisma.employeeProfile.findMany({
      where: {
        teamId: vantageTeamId,
        level: 'L4'
      },
      include: {
        user: true
      }
    });

    if (l4Employees.length === 0) {
      console.log("No L4 employees found in Vantage team.");
      return;
    }

    const l4UserIds = l4Employees.map(e => e.id);
    console.log(`Found ${l4UserIds.length} L4 employees.`);

    // 3. Find Placements for these users
    const placements = await prisma.placement.findMany({
      where: {
        employeeId: { in: l4UserIds }
      }
    });

    console.log(`Found ${placements.length} placements to delete.`);

    if (placements.length === 0) {
      console.log("No placements to purge.");
      return;
    }

    // 4. Generate Snapshot CSV
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    
    const csvPath = path.join(backupDir, `vantage_l4_purge_${timestamp}.csv`);
    const headers = Object.keys(placements[0]).join(',');
    const rows = placements.map(p => Object.values(p).map(v => 
      typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
    ).join(','));
    
    fs.writeFileSync(csvPath, [headers, ...rows].join('\n'));
    console.log(`Snapshot saved to: ${csvPath}`);

    // 5. Perform Hard Delete
    const deleteResult = await prisma.placement.deleteMany({
      where: {
        employeeId: { in: l4UserIds }
      }
    });

    console.log(`Successfully deleted ${deleteResult.count} placements.`);

    // Verification
    const remaining = await prisma.placement.count({
      where: {
        employeeId: { in: l4UserIds }
      }
    });
    console.log(`Verification: ${remaining} placements remaining (should be 0).`);

  } catch (error) {
    console.error("Error during purge:", error);
  } finally {
    await prisma.$disconnect();
  }
}

purgeVantageL4();
