
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = path.join(__dirname, 'debug_log.txt');
fs.writeFileSync(logFile, "Starting Log\n");
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + "\n");
}

// Helper to parse dates
const parseExcelDate = (serial) => {
    if (!serial) return new Date();
    if (typeof serial === 'number') {
        return new Date(Math.round((serial - 25569) * 86400 * 1000));
    }
    const d = new Date(serial);
    if (isNaN(d.getTime())) return new Date();
    return d;
};

// Helper to parse currency/numbers
const parseNumber = (val) => {
    if (val === undefined || val === null || val === '' || val === 'NA') return 0;
    if (typeof val === 'number') return val;
    const clean = String(val).replace(/[^0-9.-]/g, '');
    return Number(clean) || 0;
};

async function main() {
    const report = {
        deletedPlacements: 0,
        importedPlacements: 0,
        updatedTargets: 0,
        errors: []
    };

    log("Starting Operation...");

    // ---------------------------------------------------------
    // 1. DELETE EXISTING PLACEMENTS (CSK, Pioneer-Lucky)
    // ---------------------------------------------------------
    log("\n--- Step 1: Deleting Placements for CSK and Pioneer-Lucky ---");
    const teamsToDelete = ['CSK', 'Pioneer-Lucky'];
    
    // Find Team IDs
    const teams = await prisma.team.findMany({
        where: { name: { in: teamsToDelete } },
        include: { employees: true }
    });

    const teamIds = teams.map(t => t.id);
    const employeeIds = teams.flatMap(t => t.employees.map(e => e.id));

    log(`Found teams: ${teams.map(t => t.name).join(', ')}`);
    log(`Found ${employeeIds.length} employees in these teams.`);

    if (employeeIds.length > 0) {
        const deleteResult = await prisma.placement.deleteMany({
            where: { employeeId: { in: employeeIds } }
        });
        report.deletedPlacements = deleteResult.count;
        log(`Deleted ${deleteResult.count} placements.`);
    } else {
        log("No employees found, skipping deletion.");
    }

    // ---------------------------------------------------------
    // 2. PROCESS XLSX FILE
    // ---------------------------------------------------------
    log("\n--- Step 2 & 3: Processing XLSX File ---");
    const filePath = path.join(__dirname, '../../other teams .xlsx');
    log(`Reading file: ${filePath}`);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assuming data is in first sheet
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    log(`Total Rows in Sheet: ${rows.length}`);

    let currentRecruiter = null;
    let currentRecruiterTarget = 0;
    
    // Scan state
    // We look for "Team" header to identify a new block of Recruiter Info
    // We look for "Recruiter Name" header (followed by placement headers) to identify placement rows
    
    let placementHeaderIndex = -1;
    let placementCols = {};
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        // Convert row to string for fuzzy matching if needed, but rely on column scanning
        const rowValues = row.map(c => String(c || "").trim().toLowerCase());
        
        // Check for Team Info Header
        // Use rowValues.includes to be case insensitive/trimmed
        if (rowValues.includes("team") && rowValues.includes("yearly placement target")) {
            // Next row should be the data
            const dataRow = rows[i + 1];
            if (dataRow) {
                const recruiterIdx = rowValues.indexOf("recruiter name");
                const targetIdx = rowValues.indexOf("yearly placement target");
                
                if (recruiterIdx !== -1 && targetIdx !== -1) {
                    const recruiterName = dataRow[recruiterIdx];
                    const target = parseNumber(dataRow[targetIdx]);
                    
                    if (recruiterName) {
                        currentRecruiter = String(recruiterName).trim();
                        currentRecruiterTarget = target;
                        
                        log(`Found Recruiter Info: ${currentRecruiter}, Target: ${target}`);
                        
                        // Update Target in DB
                        try {
                            const user = await prisma.user.findFirst({
                                where: { name: { equals: currentRecruiter, mode: 'insensitive' } }
                            });
                            
                            if (user) {
                                await prisma.employeeProfile.update({
                                    where: { id: user.id },
                                    data: { yearlyTarget: target, targetType: 'PLACEMENTS' }
                                });
                                report.updatedTargets++;
                                log(`  -> Updated Target for ${currentRecruiter}`);
                            } else {
                                console.warn(`  -> User not found in DB: ${currentRecruiter}`);
                                report.errors.push(`User not found: ${currentRecruiter}`);
                            }
                        } catch (err) {
                            console.error(`  -> Error updating target for ${currentRecruiter}:`, err.message);
                            report.errors.push(`Error updating target for ${currentRecruiter}: ${err.message}`);
                        }
                    }
                }
            }
            // Skip the data row in main loop? No, loop continues.
            continue; 
        }

        // Check for Placement Header
        // "Recruiter Name", "Candidate Name", "DOJ", "Client ID"
        if (rowValues.includes("candidate name") && rowValues.includes("client id")) {
            placementHeaderIndex = i;
            // Map columns
            const headers = rowValues; // Already lowercased and trimmed
            placementCols = {
                recruiterName: headers.findIndex(h => h.includes('recruiter name')),
                candidateName: headers.findIndex(h => h.includes('candidate name')),
                doj: headers.findIndex(h => h === 'doj'),
                client: headers.findIndex(h => h === 'client'), // Exact match to avoid "client id"
                clientId: headers.findIndex(h => h.includes('client id')),
                jpcId: headers.findIndex(h => h.includes('jpc id')),
                placementType: headers.findIndex(h => h.includes('placement type')),
                revenue: headers.findIndex(h => h.includes('revenue generated')),
                margin: headers.findIndex(h => h.includes('margin')),
                billedHours: headers.findIndex(h => h.includes('billed hours')),
                billingStatus: headers.findIndex(h => h.includes('billing status')),
                daysCompleted: headers.findIndex(h => h.includes('days completed')),
                qualifier: headers.findIndex(h => h.includes('revenue qualifier')),
                incentiveAmount: headers.findIndex(h => h.includes('incentive amount')),
                incentivePaid: headers.findIndex(h => h.includes('incentive paid')),
                doq: headers.findIndex(h => h === 'doq')
            };
            log(`Placement Headers Found at row ${i}`);
            // log("Column Mapping:", placementCols);
            continue;
        }

        // Process Placement Rows
        if (placementHeaderIndex !== -1 && i > placementHeaderIndex) {
            // Stop if we hit a new header block (e.g. "Team")
            if (rowValues.includes("team") && rowValues.includes("yearly placement target")) {
                placementHeaderIndex = -1; // Reset
                i--; // Re-process this row as Team Header
                continue;
            }

            // Extract data
            // Use currentRecruiter if row's recruiter col is empty
            let rowRecruiter = placementCols.recruiterName !== -1 ? row[placementCols.recruiterName] : null;
            let effectiveRecruiter = rowRecruiter ? String(rowRecruiter).trim() : currentRecruiter;
            
            // If no candidate name, skip (empty row)
            const candidateName = placementCols.candidateName !== -1 ? row[placementCols.candidateName] : null;
            if (!candidateName) {
                log(`Row ${i}: Skipping, no candidate name`);
                continue;
            }

            if (!effectiveRecruiter) {
                console.warn(`Row ${i}: No recruiter identified. Skipping.`);
                continue;
            }

            // Process Placement
            try {
                // Find User
                const user = await prisma.user.findFirst({
                    where: { name: { equals: effectiveRecruiter, mode: 'insensitive' } }
                });

                if (!user) {
                    console.warn(`  -> Skipping placement, user not found: ${effectiveRecruiter}`);
                    report.errors.push(`User not found: ${effectiveRecruiter}`);
                    continue;
                }

                // Prepare Data
                const clientId = placementCols.clientId !== -1 ? String(row[placementCols.clientId] || "-") : "-";
                const clientName = placementCols.client !== -1 ? String(row[placementCols.client] || "") : "";
                const doj = parseExcelDate(row[placementCols.doj]);
                
                // Construct Placement Object
                const placementData = {
                    clientId: clientId,
                    jpcId: placementCols.jpcId !== -1 ? String(row[placementCols.jpcId] || "-") : "-",
                    doj: doj,
                    doq: placementCols.doq !== -1 ? (String(row[placementCols.doq]) !== 'NA' ? parseExcelDate(row[placementCols.doq]) : null) : null,
                    clientName: clientName,
                    placementType: placementCols.placementType !== -1 ? (String(row[placementCols.placementType]).toLowerCase().includes('contract') ? 'CONTRACT' : 'PERMANENT') : 'PERMANENT',
                    revenue: parseNumber(row[placementCols.revenue]),
                    totalRevenue: parseNumber(row[placementCols.revenue]), // Map both just in case
                    marginPercent: parseNumber(row[placementCols.margin]),
                    billedHours: parseNumber(row[placementCols.billedHours]),
                    billingStatus: placementCols.billingStatus !== -1 ? (String(row[placementCols.billingStatus]).toLowerCase() === 'active' ? 'BILLED' : (String(row[placementCols.billingStatus]).toLowerCase() === 'done' ? 'BILLED' : 'PENDING')) : 'PENDING',
                    daysCompleted: parseNumber(row[placementCols.daysCompleted]),
                    qualifier: placementCols.qualifier !== -1 ? String(row[placementCols.qualifier]).toLowerCase() === 'yes' : false,
                    incentiveAmountInr: parseNumber(row[placementCols.incentiveAmount]),
                    incentivePaid: placementCols.incentivePaid !== -1 ? (parseNumber(row[placementCols.incentivePaid]) > 0 || String(row[placementCols.incentivePaid]).toLowerCase() === 'yes') : false,
                    
                    // Defaults
                    placementCredit: 1,
                };

                // Upsert
                const existing = await prisma.placement.findFirst({
                    where: {
                        employeeId: user.id,
                        candidateName: { equals: candidateName, mode: 'insensitive' },
                        clientName: { equals: clientName, mode: 'insensitive' },
                    }
                });

                if (existing) {
                    await prisma.placement.update({
                        where: { id: existing.id },
                        data: placementData
                    });
                    log(`  -> Updated placement for ${candidateName}`);
                } else {
                    await prisma.placement.create({
                        data: {
                            ...placementData,
                            employeeId: user.id,
                            candidateName: candidateName
                        }
                    });
                    report.importedPlacements++;
                    log(`  -> Created placement for ${candidateName}`);
                }

            } catch (err) {
                console.error(`  -> Error processing placement for ${candidateName}:`, err.message);
                report.errors.push(`Error placement ${candidateName}: ${err.message}`);
            }
        }
    }

    // ---------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------
    log("\n============================================");
    log("              SUMMARY REPORT                ");
    log("============================================");
    log(`Deleted Placements (CSK, Pioneer-Lucky): ${report.deletedPlacements}`);
    log(`Imported/Updated Placements: ${report.importedPlacements}`); 
    log(`Updated Recruiter Targets: ${report.updatedTargets}`);
    log("--------------------------------------------");
    if (report.errors.length > 0) {
        log("Errors encountered:");
        report.errors.forEach(e => log(` - ${e}`));
    } else {
        log("No errors encountered.");
    }
    log("============================================");
}

main()
  .catch(e => {
      console.error(e);
      log(`CRITICAL ERROR: ${e.message}`);
  })
  .finally(async () => await prisma.$disconnect());
