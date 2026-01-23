
import fs from 'fs';
import xlsx from 'xlsx';
import prisma from '../src/prisma.js';

// --- Helper Functions ---

function parseExcelDate(excelDate) {
  if (!excelDate) return null;
  if (excelDate instanceof Date) return excelDate;
  
  // Excel date serial number
  if (typeof excelDate === 'number') {
      // Excel base date is Dec 30, 1899
      const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
      return date;
  }
  
  // String parsing (e.g., "12-Mar-24" or "3/12/2024")
  const date = new Date(excelDate);
  if (!isNaN(date.getTime())) return date;
  
  return null;
}

function calculateDaysCompleted(doj, billingStatus) {
  if (!doj) return 0;
  if (billingStatus === 'DROPPED' || billingStatus === 'BACKOUT') return 0;
  const now = new Date();
  const diffTime = Math.abs(now - new Date(doj));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
}

function checkQualifier(days) {
  return days >= 90;
}

function mapBillingStatus(status) {
  if (!status) return 'PENDING';
  const s = String(status).toUpperCase();
  if (s.includes('BILLED')) return 'BILLED';
  if (s.includes('DROPPED') || s.includes('NO BILL') || s.includes('BACKOUT')) return 'CANCELLED';
  return 'PENDING';
}

function mapPlacementType(type) {
  if (!type) return 'PERMANENT';
  const t = String(type).toUpperCase();
  if (t.includes('CONTRACT')) return 'CONTRACT';
  return 'PERMANENT';
}

function parseCurrency(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
  return isNaN(num) ? 0 : num;
}

// --- Main Script ---

async function uploadOtherTeamsData() {
    const filePath = 'c:/Users/sahil/OneDrive/Desktop/Full Stack/ritwil/other teams .xlsx';
    console.log(`Reading file: ${filePath}`);
    
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    console.log(`Total Rows: ${data.length}`);

    let mode = 'SEARCHING_TEAM_BLOCK'; // SEARCHING_TEAM_BLOCK, EXPECT_RECRUITER_INFO, EXPECT_PLACEMENT_HEADER, READING_PLACEMENTS
    let recruiterNameIndex = 0;
    let vbidIndex = -1;
    let currentRecruiterName = null;
    let currentVbid = null;
    
    let cols = {
        candidateName: 1,
        doj: 2,
        client: 3,
        location: 4,
        candidateId: 5, // Estimated
        revenue: 6,
        billingStatus: 7,
        incentiveAmountInr: 8,
        incentivePaid: 9
    };

    const placementsToUpload = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const firstCell = String(row[0]).trim();
        const secondCell = String(row[1]).trim();
        const thirdCell = String(row[2]).trim();

        // 1. Detect Team Block Header
        if (firstCell === "Team" || firstCell.startsWith("Team")) {
            // Usually: "Team", "TL Name", "Recruiter Name"
            // Find "Recruiter Name" index
            let foundIndex = -1;
            vbidIndex = -1;
            row.forEach((cell, idx) => {
                const cellStr = String(cell).trim();
                if (cellStr === "Recruiter Name") foundIndex = idx;
                if (cellStr === "VB Code") vbidIndex = idx;
            });

            if (foundIndex !== -1) {
                console.log(`Row ${i}: Found Team Block. Recruiter Name at index ${foundIndex}`);
                recruiterNameIndex = foundIndex;
                mode = 'EXPECT_RECRUITER_INFO';
                continue;
            }
        }

        // 2. Expect Recruiter Info (Next row after header)
        if (mode === 'EXPECT_RECRUITER_INFO') {
            const rName = row[recruiterNameIndex];
            // Sometimes there are empty rows or sub-headers
            if (rName && String(rName).trim() !== "Recruiter Name") {
                currentRecruiterName = String(rName).trim();
                
                // Capture VBID if index found
                if (vbidIndex !== -1) {
                    currentVbid = row[vbidIndex];
                }
                
                console.log(`Row ${i}: Found Recruiter Info: "${currentRecruiterName}" (VBID: ${currentVbid})`);
                mode = 'EXPECT_PLACEMENT_HEADER';
            }
            continue;
        }

        // 3. Expect Placement Header
        if (mode === 'EXPECT_PLACEMENT_HEADER' || (firstCell === "Recruiter Name" && secondCell === "Candidate Name")) {
             if (firstCell === "Recruiter Name" && secondCell === "Candidate Name") {
                 console.log(`Row ${i}: Found Placement Header -> Switching to READING_PLACEMENTS`);
                 mode = 'READING_PLACEMENTS';
                 
                 // Update Recruiter Index for PLACEMENT BLOCK (usually 0)
                 recruiterNameIndex = 0; 

                 cols = {
                    recruiterName: 0,
                    candidateName: 1,
                    doj: 2,
                    client: 3, // Sometimes "Client"
                    location: 4,
                    revenue: 6, // "Revenue"
                    billingStatus: 7, // "Billing Status"
                    incentiveAmountInr: 8, // "Incentive Amount"
                    incentivePaid: 9 // "Incentive Paid"
                 };

                 // Refine columns dynamically
                 row.forEach((cell, idx) => {
                     const val = String(cell).trim().toLowerCase();
                     if (val.includes("recruiter")) cols.recruiterName = idx;
                     else if (val.includes("candidate name")) cols.candidateName = idx;
                     else if (val.includes("doj")) cols.doj = idx;
                     else if (val.includes("doi")) cols.doi = idx;
                     else if (val.includes("client") && !val.includes("candidate")) {
                        if (val.includes("id")) cols.clientId = idx;
                        else cols.client = idx;
                     }
                     else if (val.includes("location")) cols.location = idx;
                     else if (val.includes("candidate id")) cols.candidateId = idx;
                     else if (val.includes("revenue")) cols.revenue = idx;
                     else if (val.includes("status")) cols.billingStatus = idx;
                     else if (val.includes("incentive") && val.includes("amount")) cols.incentiveAmountInr = idx;
                     else if (val.includes("paid")) cols.incentivePaid = idx;
                     else if (val.includes("jpc")) cols.jpcId = idx;
                     else if (val.includes("type")) cols.placementType = idx;
                     else if (val.includes("margin")) cols.marginPercent = idx;
                     else if (val.includes("hours")) cols.billedHours = idx;
                 });
                 continue;
             }
        }

        // 4. Reading Placements
        if (mode === 'READING_PLACEMENTS') {
            // Detect if we hit a new Team Block (Header "Team")
            if (firstCell === "Team" || firstCell.startsWith("Team")) {
                // Rewind to process this line as Team Block
                i--; 
                mode = 'SEARCHING_TEAM_BLOCK';
                continue;
            }

            // Check if it's a new header inside the block (rare but possible)
            if (firstCell === "Recruiter Name" && secondCell === "Candidate Name") {
                // Just update cols
                continue;
            }
            
            // Check if it's a summary line or empty
            if (!row[cols.candidateName]) continue;

            let rawRecruiterVal = row[recruiterNameIndex];
            let recruiterName = currentRecruiterName;

            // If row has a recruiter name, use it (override block level)
            if (rawRecruiterVal) {
                 const valStr = String(rawRecruiterVal).trim();
                 const upper = valStr.toUpperCase();
                 if (upper !== "VB CODE" && upper !== "RECRUITER NAME" && upper !== "TEAM" && !upper.includes("TOTAL")) {
                     recruiterName = valStr;
                     currentRecruiterName = recruiterName; // Update current
                 }
            }
            
            if (!recruiterName) continue;

            let candidateId = cols.candidateId !== undefined ? String(row[cols.candidateId] || "") : null;
            let clientId = cols.clientId !== undefined ? String(row[cols.clientId] || "") : null;
             // Clean JPC ID
            let jpcId = cols.jpcId !== undefined ? String(row[cols.jpcId] || "") : null;
            if (jpcId && jpcId.toUpperCase().startsWith("JPC - ")) {
                jpcId = jpcId.substring(6).trim();
            }

            placementsToUpload.push({
                recruiterName: String(recruiterName).trim(),
                vbid: currentVbid, 
                candidateName: row[cols.candidateName],
                candidateId: cols.candidateId !== undefined ? String(row[cols.candidateId] || "") : null,
                clientId: clientId,
                clientName: String(row[cols.client || cols.clientName] || "Unknown Client"),
                jpcId: jpcId,
                doj: parseExcelDate(row[cols.doj]),
                doi: cols.doi !== undefined ? parseExcelDate(row[cols.doi]) : parseExcelDate(row[cols.doj]),
                revenue: row[cols.revenue],
                billingStatus: row[cols.billingStatus],
                incentiveAmountInr: row[cols.incentiveAmountInr],
                incentivePaid: String(row[cols.incentivePaid]).toLowerCase() === 'yes',
                placementType: cols.placementType !== undefined ? String(row[cols.placementType] || "PERMANENT").toUpperCase() : "PERMANENT",
                marginPercent: cols.marginPercent !== undefined ? row[cols.marginPercent] : null,
                billedHours: cols.billedHours !== undefined ? row[cols.billedHours] : null,
            });
        }
    }

    console.log(`Extracted ${placementsToUpload.length} placements.`);
    
    // --- DB SAVING LOGIC ---
    
    const createdPlacements = [];
    const updatedPlacements = [];
    const errors = [];
    
    console.log("Starting DB Upload...");

    for (const data of placementsToUpload) {
        try {
            const { recruiterName, vbid, candidateName, clientName, jpcId, doj, doi, revenue, billingStatus, incentiveAmountInr, incentivePaid, placementType, marginPercent, billedHours, candidateId } = data;

            // 1. Find User
            let user = await prisma.user.findFirst({
                where: { name: { equals: recruiterName, mode: 'insensitive' } }
            });
            
            if (!user) {
                // Create User
                console.log(`Creating user: ${recruiterName}`);
                const baseEmail = recruiterName.replace(/[^a-zA-Z0-9]/g, '.').toLowerCase() + '@vbeyond.com';
                let email = baseEmail;
                let counter = 1;
                while (await prisma.user.findUnique({ where: { email } })) {
                    email = baseEmail.replace('@', `${counter}@`);
                    counter++;
                }
                
                try {
                     user = await prisma.user.create({
                         data: {
                             name: recruiterName,
                             email: email,
                             passwordHash: '$2a$10$McDSEu7JWMAtZo0ykFIRx.U1Lf/qBQl/rF92qLxvM8VCRXdgsFSea',
                             role: 'EMPLOYEE',
                             employeeProfile: {
                                 create: { vbid: vbid }
                             }
                         }
                     });
                } catch (e) {
                    console.error(`Failed to create user ${recruiterName}: ${e.message}`);
                    errors.push({ data, error: e.message });
                    continue;
                }
            }

            // 2. Process Placement
            const validDoj = doj ? new Date(doj) : new Date();
            const validDoi = doi ? new Date(doi) : validDoj;
            const daysCompleted = calculateDaysCompleted(validDoj, billingStatus);
            const qualifier = checkQualifier(daysCompleted);
            const normalizedBillingStatus = mapBillingStatus(billingStatus);
            const normalizedPlacementType = mapPlacementType(placementType);

            // Check duplicate
            const existingPlacement = await prisma.placement.findFirst({
                where: {
                    employeeId: user.id,
                    candidateName: { equals: candidateName, mode: 'insensitive' },
                    clientName: { equals: clientName, mode: 'insensitive' }
                }
            });

            if (existingPlacement) {
                // Update
                await prisma.placement.update({
                    where: { id: existingPlacement.id },
                    data: {
                        candidateId, jpcId, doi: validDoi, doj: validDoj, daysCompleted,
                        placementType: normalizedPlacementType,
                        billedHours: billedHours ? Number(billedHours) : null,
                        marginPercent: parseCurrency(marginPercent),
                        revenue: parseCurrency(revenue),
                        billingStatus: normalizedBillingStatus,
                        incentiveAmountInr: parseCurrency(incentiveAmountInr),
                        incentivePaid: incentivePaid,
                        qualifier
                    }
                });
                updatedPlacements.push(candidateName);
            } else {
                // Create
                await prisma.placement.create({
                    data: {
                        employee: { connect: { id: user.id } },
                        candidateName: candidateName,
                        clientName: clientName,
                        candidateId: candidateId,
                        clientId: clientId,
                        jpcId: jpcId,
                        doi: validDoi, doj: validDoj, daysCompleted,
                        placementType: normalizedPlacementType,
                        billedHours: billedHours ? Number(billedHours) : null,
                        marginPercent: parseCurrency(marginPercent),
                        revenue: parseCurrency(revenue),
                        billingStatus: normalizedBillingStatus,
                        incentiveAmountInr: parseCurrency(incentiveAmountInr),
                        incentivePaid: incentivePaid,
                        qualifier
                    }
                });
                createdPlacements.push(candidateName);
            }

        } catch (err) {
            console.error(`Error processing ${data.candidateName}: ${err.message}`);
            errors.push({ data, error: err.message });
        }
    }
    
    console.log(`Done! Created: ${createdPlacements.length}, Updated: ${updatedPlacements.length}, Errors: ${errors.length}`);
}

uploadOtherTeamsData()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
