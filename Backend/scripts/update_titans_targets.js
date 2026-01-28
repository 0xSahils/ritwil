import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../../titans.xlsx');

async function main() {
  try {
    console.log("Reading titans.xlsx...");
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`Total rows: ${data.length}`);

    let updatedCount = 0;
    let notFoundCount = 0;

    // Find header index
    let headerIndex = -1;
    for (let i = 0; i < data.length; i++) {
        if (data[i][0] === 'Team' && data[i][2] === 'Recruiter Name') {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) {
        console.error("Could not find main header row.");
        return;
    }

    const header = data[headerIndex];
    const targetIndex = 4; // "Yearly Placement Target" based on inspection
    const nameIndex = 2;   // "Recruiter Name"

    console.log("Processing rows...");

    for (let i = headerIndex + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        // Check if this is a recruiter row. 
        // Logic: Col 0 should be "Titans" (or the team name)
        // And it shouldn't be a header row (checked by content)
        if (String(row[0]).trim() === 'Titans') {
            const name = String(row[nameIndex]).trim();
            let target = parseInt(row[targetIndex]);

            // "if some data of target placement not present keep it to 10 or 15"
            if (isNaN(target) || target <= 0) {
                target = 10;
            }

            console.log(`Found Recruiter: ${name}, Target: ${target}`);

            // Find user in DB (User table has the name)
            let user = await prisma.user.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: 'insensitive' 
                    }
                }
            });

            if (user) {
                // Update EmployeeProfile
                try {
                    await prisma.employeeProfile.update({
                        where: { id: user.id },
                        data: {
                            yearlyTarget: target,
                            targetType: 'PLACEMENTS'
                        }
                    });
                    console.log(`  -> Updated ${name} (Target: ${target})`);
                    updatedCount++;
                } catch (e) {
                     if (e.code === 'P2025') {
                         console.log(`  -> User found but no EmployeeProfile: ${name}`);
                     } else {
                         console.error(`  -> Error updating ${name}:`, e.message);
                     }
                }
            } else {
                console.log(`  -> User not found in DB: ${name}`);
                notFoundCount++;
            }
        }
    }

    console.log("------------------------------------------------");
    console.log(`Summary: Updated ${updatedCount} users. Not found ${notFoundCount} users.`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
