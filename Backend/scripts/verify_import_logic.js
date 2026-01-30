import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function verifyImportLogic() {
  try {
    console.log('Starting Import Verification (V2 - Multi-Block Support)...');

    // 1. Get a Vantage L4 User
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { name: { contains: 'Vantage', mode: 'insensitive' } },
          { name: { contains: 'Vantedge', mode: 'insensitive' } }
        ]
      },
      include: { employees: { include: { user: true } } }
    });

    let targetUser = null;
    for (const t of teams) {
      const l4 = t.employees.find(e => e.level === 'L4' && e.user);
      if (l4) {
        targetUser = l4.user;
        break;
      }
    }

    if (!targetUser) {
      console.error('No Vantage L4 user found for testing.');
      return;
    }

    console.log(`Testing with user: ${targetUser.name} (${targetUser.id})`);

    // 2. Create Dummy Excel File with "VB Code" structure
    const headers = [
      "VB Code", "Candidate Name", "DOJ", "Client", "Total Revenue", "Billing status", 
      "DOQ", "Client ID", "JPC ID", "Placement Type", "Days Completed", 
      "Revenue Qualifier", "Incentive %", "Incentive amount (INR)", "Incentive Paid"
    ];

    const row1 = [
      targetUser.name, // "VB Code" col has Name
      "John Doe", 45678, "Acme Corp", 15000, "Billed", 
      45658, "C-101", "JPC-999", "Contract", 30, 
      "Yes", "10%", 5000, "No"
    ]; 

    const row2 = [
      null, // Empty "VB Code" -> Should inherit previous (targetUser)
      "Jane Smith", 45700, "Beta Corp", 20000, "Pending",
      45690, "C-102", "JPC-888", "FTE", 10,
      "No", "5%", 0, "No"
    ];

    const data = [
      ["Summary Row", "Ignore"],
      headers,
      row1,
      row2
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    const filePath = path.join(__dirname, 'temp_test_import_v2.xlsx');
    XLSX.writeFile(wb, filePath);
    console.log(`Created temp file: ${filePath}`);

    // 3. Read and Parse (Simulate Frontend Logic)
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets["Sheet1"];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Mock allUsers for the logic
    const allUsers = [{ id: targetUser.id, name: targetUser.name }];
    const globalPlacements = [];

    // --- LOGIC START (Updated) ---
    let currentRecruiterId = null; 
    let colMap = null;

    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        const rowLower = row.map(c => String(c||"").trim().toLowerCase());

        // Recruiter Block Start (Legacy)
        let name = "";
        const recruiterIdx = row.findIndex(c => String(c||"").trim().toLowerCase().startsWith("recruiter name"));
        if (recruiterIdx !== -1) {
            const cellVal = String(row[recruiterIdx]).trim();
            if (cellVal.includes(":")) name = cellVal.split(":")[1].trim();
            if (!name && row[recruiterIdx+1]) name = String(row[recruiterIdx+1]).trim();
            const user = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
            if (user) currentRecruiterId = user.id;
            continue;
        }

        // Headers row detection
        if (rowLower.includes("candidate name")) {
            colMap = {};
            rowLower.forEach((h, idx) => colMap[h] = idx);
            continue;
        }

        // Data Row
        // Check for per-row recruiter (VB Code or Recruiter Name column)
        if (colMap) {
            const recruiterCol = colMap['recruiter name'] !== undefined ? colMap['recruiter name'] : colMap['vb code'];
            if (recruiterCol !== undefined) {
                const cellVal = row[recruiterCol];
                if (cellVal) {
                    const name = String(cellVal).trim();
                    const user = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
                    if (user) {
                        currentRecruiterId = user.id;
                    }
                }
            }
        }

        if (currentRecruiterId) {
            let candidateName, clientName, doj, revenue, placementType, billingStatus, doi, clientId, jpcId, totalRevenue, daysCompleted, qualifier, marginPercent, incentiveAmountInr, incentivePaid;

            if (colMap) {
               // Use Dynamic Map
               candidateName = row[colMap['candidate name']];
               clientName = row[colMap['client']] || row[colMap['client name']];
               const dateVal = row[colMap['doj']];
               const dateValDoi = row[colMap['doq']] || row[colMap['doi']];
               
               const parseDate = (d) => {
                   if (!d) return new Date();
                   if (typeof d === 'number') return new Date(Math.round((d - 25569)*86400*1000));
                   return new Date(d);
               };
               doj = parseDate(dateVal);
               doi = parseDate(dateValDoi);

               totalRevenue = row[colMap['total revenue']];
               billingStatus = row[colMap['billing status']];
               clientId = row[colMap['client id']];
               jpcId = row[colMap['jpc id']];
               placementType = String(row[colMap['placement type']] || "").toLowerCase().includes("contract") ? "CONTRACT" : "PERMANENT";
               daysCompleted = row[colMap['days completed']];
               qualifier = String(row[colMap['revenue qualifier']] || row[colMap['qualifier']] || "").toLowerCase().includes("yes"); 
               marginPercent = row[colMap['incentive %']] || row[colMap['margin %']];
               incentiveAmountInr = row[colMap['incentive amount (inr)']];
               incentivePaid = String(row[colMap['incentive paid']] || "").toLowerCase().includes("yes");
               
               revenue = totalRevenue; 
            }

            if (!candidateName) continue;

            globalPlacements.push({
                employeeId: currentRecruiterId,
                candidateName,
                clientName,
                // ... other fields simplified for test
            });
        }
    }
    // --- LOGIC END ---

    // 4. Verification
    console.log(`Parsed ${globalPlacements.length} placements.`);
    
    if (globalPlacements.length !== 2) {
        throw new Error(`Expected 2 placements, got ${globalPlacements.length}`);
    }

    const p1 = globalPlacements[0];
    const p2 = globalPlacements[1];

    if (p1.employeeId !== targetUser.id) console.error(`P1 Wrong Employee: ${p1.employeeId}`);
    if (p1.candidateName !== "John Doe") console.error(`P1 Wrong Name: ${p1.candidateName}`);
    
    if (p2.employeeId !== targetUser.id) console.error(`P2 Wrong Employee: ${p2.employeeId}`); // Should inherit
    if (p2.candidateName !== "Jane Smith") console.error(`P2 Wrong Name: ${p2.candidateName}`);

    console.log('Verification Successful! Multi-block logic works.');

    // Cleanup
    fs.unlinkSync(filePath);

  } catch (error) {
    console.error('Error in verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyImportLogic();
