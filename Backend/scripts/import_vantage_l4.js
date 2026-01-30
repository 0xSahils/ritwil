
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse dates
const parseExcelDate = (serial) => {
    if (!serial) return new Date();
    if (typeof serial === 'number') {
        // Excel date serial number to JS Date
        return new Date(Math.round((serial - 25569) * 86400 * 1000));
    }
    const d = new Date(serial);
    if (isNaN(d.getTime())) return new Date();
    return d;
};

// Helper to parse currency
const parseCurrency = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    const clean = String(val).replace(/[^0-9.-]/g, '');
    return Number(clean) || 0;
};

async function importVantageL4() {
    const filePath = path.join(__dirname, '../../vantege.xlsx');
    console.log(`Reading file: ${filePath}`);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with array of arrays first to find headers
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    
    // Find Header Row (row containing "Candidate Name")
    let headerRowIndex = -1;
    for(let i=0; i<rows.length; i++) {
        const row = rows[i];
        if(row && row.some(cell => String(cell).toLowerCase().includes('candidate name'))) {
            headerRowIndex = i;
            break;
        }
    }
    
    if (headerRowIndex === -1) {
        console.error("Could not find header row containing 'Candidate Name'");
        return;
    }
    
    console.log(`Found header row at index ${headerRowIndex}`);
    const headers = rows[headerRowIndex].map(h => String(h || "").trim().toLowerCase());
    console.log("Headers:", headers);
    
    // Map Columns
    const cols = {
        recruiterName: headers.findIndex(h => h.includes('recruiter name')), 
        candidateName: headers.findIndex(h => h.includes('candidate name')),
        doj: headers.findIndex(h => h.includes('doj')),
        client: headers.findIndex(h => h === 'client' || h.includes('client name')),
        totalRevenue: headers.findIndex(h => h.includes('total revenue')),
        billingStatus: headers.findIndex(h => h.includes('billing status')),
        doq: headers.findIndex(h => h.includes('doq')),
        clientId: headers.findIndex(h => h.includes('client id')),
        jpcId: headers.findIndex(h => h.includes('jpc id')),
        placementType: headers.findIndex(h => h.includes('placement type')),
        daysCompleted: headers.findIndex(h => h.includes('days completed')),
        revenueQualifier: headers.findIndex(h => h.includes('revenue qualifier') || h.includes('qualifier')),
        incentiveAmountInr: headers.findIndex(h => h.includes('incentive amount') && h.includes('inr')),
        incentivePaid: headers.findIndex(h => h.includes('incentive paid'))
    };

    // Fallback for Recruiter Name: The sheet might label it "VB Code" but contain Names in the data rows
    if (cols.recruiterName === -1) {
        cols.recruiterName = headers.findIndex(h => h.includes('vb code'));
    }

    // Also try finding just "Incentive Amount" if INR specific one fails
    if (cols.incentiveAmountInr === -1) {
        cols.incentiveAmountInr = headers.findIndex(h => h.includes('incentive amount'));
    }

    console.log("Column Mapping:", cols);
    
    const placementsToProcess = [];
    let currentRecruiterName = null; // State to track recruiter across empty rows
    
    // Process Data Rows
    for(let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const candidateName = row[cols.candidateName];
        if (!candidateName) continue; // Skip empty rows
        
        // Recruiter Propagation Logic
        let rowRecruiter = row[cols.recruiterName];
        if (rowRecruiter) {
            currentRecruiterName = String(rowRecruiter).trim();
        } else if (!currentRecruiterName && i > headerRowIndex) {
             // If we are on the first data row and it's empty, we need to check if there is a "VB Code" row immediately above the header?
             // Or maybe the user meant "Team | VB Code | Recruiter Name" is ABOVE the "Recruiter Name | Candidate Name" header?
             // The user snippet shows:
             // Team | VB Code | Recruiter Name ...
             // Vantedge | VB0002 | Syed Ahrar Abbas Zaidi ...
             // Recruiter Name | Candidate Name ...
             // Syed Ahrar Abbas Zaidi | Sandeep Padhye ...
             
             // So the recruiter name IS in the row with data.
             // But for SUBSEQUENT rows (Devin Currens etc), the Recruiter Name cell is EMPTY.
             // So we just need to keep the `currentRecruiterName` from the previous iteration.
             // The loop structure:
             // Row 1: "Syed..." -> sets currentRecruiterName
             // Row 2: "" -> uses currentRecruiterName
             // The issue is `currentRecruiterName` is defined INSIDE `importVantageL4` but outside the loop? Yes.
             // But in the logs: "Row 117: No recruiter name found and no previous recruiter to propagate."
             // This implies `currentRecruiterName` is null.
             // Why? Maybe the FIRST row of the placement block didn't have a recruiter name in the specific column index we found?
             // Or the index `cols.recruiterName` is wrong?
             // Let's debug the value at `cols.recruiterName`.
        }
        
        if (!currentRecruiterName) {
            // Try to find it in the "VB Code" style block ABOVE the header?
            // The structure is:
            // [Team Info Row]
            // [Header Row]
            // [Data Rows]
            
            // If the header row index is X.
            // Check Row X-1 or X-2 for Recruiter Name?
            // User snippet:
            // Row X-2: Team | VB Code | Recruiter Name ...
            // Row X-1: Vantedge | VB0002 | Syed Ahrar Abbas Zaidi ...
            // Row X: Recruiter Name | Candidate Name ...
            
            // So if `currentRecruiterName` is still null, we can try to look at `rows[headerRowIndex - 1]`.
            const teamInfoRow = rows[headerRowIndex - 1];
            if (teamInfoRow) {
                // In the snippet, "Syed Ahrar Abbas Zaidi" is at index 2 (Team=0, VB=1, Name=2)
                // BUT we don't know the exact index.
                // However, we know "Recruiter Name" header in Row X-2 was at index 2.
                // Let's assume the Team Info Block follows a similar column structure or we just search for the name.
                // But wait, the snippet shows the data row ALSO has "Syed Ahrar Abbas Zaidi" in the first column (Recruiter Name).
                
                // Let's log what we are seeing in the recruiter column for the first few rows.
                 if (i < headerRowIndex + 5) {
                    console.log(`Row ${i} Recruiter Col (${cols.recruiterName}) Value:`, row[cols.recruiterName]);
                 }
            }
            
             console.warn(`Row ${i}: No recruiter name found and no previous recruiter to propagate.`);
             continue;
        }

        const billingStatus = row[cols.billingStatus] ? (String(row[cols.billingStatus]).toUpperCase() === 'COMPLETED' ? 'BILLED' : (String(row[cols.billingStatus]).toUpperCase() === 'DONE' ? 'BILLED' : 'PENDING')) : 'PENDING';
        const daysCompleted = Number(row[cols.daysCompleted]) || 0;
        
        // Revenue Qualifier Logic
        // 1. Check sheet value first
        let qualifier = false;
        const sheetQualifier = String(row[cols.revenueQualifier] || "").toLowerCase();
        
        if (sheetQualifier === 'yes') {
            qualifier = true;
        } else if (sheetQualifier === 'no') {
            // Explicit NO in sheet?
            // User says: "if not present then use logic".
            // Logic: > 90 days AND Payment Done (Billing Status == BILLED)
            qualifier = daysCompleted > 90 && billingStatus === 'BILLED';
        } else {
            // Empty or invalid in sheet -> Use Logic
            qualifier = daysCompleted > 90 && billingStatus === 'BILLED';
        }

        placementsToProcess.push({
            recruiterIdentifier: currentRecruiterName,
            candidateName,
            doj: parseExcelDate(row[cols.doj]),
            clientName: row[cols.client],
            totalRevenue: parseCurrency(row[cols.totalRevenue]),
            billingStatus,
            doq: row[cols.doq] && String(row[cols.doq]).toUpperCase() !== 'NA' ? parseExcelDate(row[cols.doq]) : null,
            clientId: row[cols.clientId],
            jpcId: row[cols.jpcId],
            placementType: String(row[cols.placementType] || "PERMANENT").toUpperCase().includes("CONTRACT") ? "CONTRACT" : "PERMANENT",
            daysCompleted,
            qualifier,
            incentiveAmountInr: parseCurrency(row[cols.incentiveAmountInr]),
            incentivePaid: String(row[cols.incentivePaid] || "").toLowerCase() === 'yes'
        });
    }
    
    console.log(`Found ${placementsToProcess.length} placements to process.`);
    
    // Process DB Updates
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const p of placementsToProcess) {
        // 1. Find User
        let user = await prisma.user.findFirst({
            where: { name: { equals: String(p.recruiterIdentifier).trim(), mode: 'insensitive' } }
        });
        
        if (!user) {
            console.warn(`Skipping placement for ${p.candidateName}: User '${p.recruiterIdentifier}' not found.`);
            continue;
        }
        
        // 2. Find Existing Placement
        const existingPlacement = await prisma.placement.findFirst({
            where: {
                employeeId: user.id,
                candidateName: { equals: p.candidateName, mode: 'insensitive' },
                clientName: { equals: p.clientName, mode: 'insensitive' }
            }
        });
        
        const placementData = {
            clientId: String(p.clientId || "-"),
            jpcId: String(p.jpcId || "-"),
            
            doj: p.doj,
            doq: p.doq,
            doi: p.doq || p.doj, 
            
            totalRevenue: p.totalRevenue,
            revenue: p.totalRevenue,
            billingStatus: p.billingStatus,
            
            placementType: p.placementType,
            daysCompleted: p.daysCompleted,
            qualifier: p.qualifier,
            incentiveAmountInr: p.incentiveAmountInr,
            incentivePaid: p.incentivePaid,
            
            // Defaults
            marginPercent: 0, 
            billedHours: null,
            sourcer: null,
            accountManager: null,
            teamLead: null,
            placementSharing: null,
            placementCredit: 1, 
            revenueAsLead: null
        };

        if (existingPlacement) {
            await prisma.placement.update({
                where: { id: existingPlacement.id },
                data: placementData
            });
            updatedCount++;
        } else {
            await prisma.placement.create({
                data: {
                    ...placementData,
                    employeeId: user.id,
                    candidateName: p.candidateName,
                    clientName: p.clientName
                }
            });
            createdCount++;
        }
    }
    
    console.log(`Import Complete: Created ${createdCount}, Updated ${updatedCount}`);
}

importVantageL4()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
