
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Helper functions
function parseCurrency(value) {
  if (value === undefined || value === null || value === '') return 0;
  // Remove currency symbols and commas, keep decimals
  const str = String(value).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function parseDate(value) {
  if (!value) return null;
  
  // Excel serial date
  if (typeof value === 'number') {
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }
  
  // String date
  const date = new Date(value);
  if (!isNaN(date.getTime())) return date;
  
  return null;
}

function mapBillingStatus(status) {
  if (!status) return "PENDING";
  const s = String(status).toUpperCase().trim();
  if (["PENDING", "BILLED", "CANCELLED", "HOLD"].includes(s)) return s;
  if (s === "DONE" || s === "ACTIVE" || s === "COMPLETED") return "BILLED";
  if (s === "CANCELED") return "CANCELLED";
  if (s === "ON HOLD") return "HOLD";
  if (s === "DROPPED" || s === "DROP") return "CANCELLED";
  return "PENDING";
}

async function processFile() {
  const filePath = path.resolve(__dirname, '../../L2 Vantage.xlsx');
  console.log(`Reading file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error("File not found!");
    return;
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Read all rows as arrays
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  console.log(`Sheet "${sheetName}" has ${rows.length} rows.`);

  // 1. Find Header Row
  let headerRowIndex = -1;
  let colMap = {};
  
  // Columns we expect in L2 Vantage.xlsx
  const expectedCols = [
    'Recruiter Name', 'Candidate Name', 'DOJ', 'Client', 
    'Total Revenue', 'Billing status', 'DOQ', 
    'Sourcer', 'Account Manager', 'TL', 
    'Days Completed', 'Placement sharing', 'Placement Credit'
  ];

  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    if (!row) continue;
    
    // Check if this row contains "Candidate Name"
    const candidateIdx = row.findIndex(c => String(c).trim().toLowerCase() === 'candidate name');
    
    if (candidateIdx !== -1) {
      headerRowIndex = i;
      console.log(`Found header row at index ${i}`);
      
      // Build column map
      row.forEach((cell, idx) => {
        if (cell) {
          colMap[String(cell).trim().toLowerCase()] = idx;
        }
      });
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.error("Could not find header row containing 'Candidate Name'");
    return;
  }

  console.log("Column Map:", JSON.stringify(colMap, null, 2));

  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  // 2. Process Data Rows
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    if (i % 10 === 0) console.log(`Processing row ${i}...`);
    const row = rows[i];
    if (!row || row.length === 0) continue;

    try {
      // Extract values using map
      const getVal = (colName) => {
        const idx = colMap[colName.toLowerCase()];
        return (idx !== undefined && row[idx] !== undefined) ? row[idx] : null;
      };

      const candidateName = getVal('Candidate Name');
      // Use 'Recruiter' column first, fallback to 'Recruiter Name'
      const recruiterVal = getVal('Recruiter');
      const recruiterNameVal = getVal('Recruiter Name');
      const recruiterName = recruiterVal || recruiterNameVal;
      
      const clientName = getVal('Client');

      // Skip garbage rows
      const garbageValues = [
          'Candidate Name', 'Recruiter Name', 'Client', 'Slab qualified', 'Team', 
          'Incentive in USD', 'Total Incentive in INR', 'Incentive Qualified', 'Yearly Target'
      ];

      if (!candidateName || !clientName || garbageValues.includes(candidateName) || garbageValues.includes(clientName)) continue;
      
      // Skip numeric garbage
      if (/^\d+(\.\d+)?$/.test(String(clientName).trim())) {
        console.log(`Skipping numeric Client: ${clientName}`);
        continue;
      }
      
      // Clean up names
      const cleanCandidateName = String(candidateName).trim();
      
      const cleanClientName = String(clientName).trim();

      if (cleanCandidateName === 'John Donaldson') {
          console.log('--- DEBUG JOHN DONALDSON ---');
          console.log('Row:', JSON.stringify(row));
          console.log('Recruiter Val:', recruiterVal);
          console.log('Recruiter Name Val:', recruiterNameVal);
          console.log('Final Recruiter:', recruiterName);
          console.log('Sourcer:', getVal('Sourcer'));
          console.log('Account Manager:', getVal('Account Manager'));
          console.log('TL:', getVal('TL'));
      }
      
      // Skip if recruiter name is missing/unknown
      if (!recruiterName || String(recruiterName).trim().toLowerCase() === 'unknown') {
        console.log(`Skipping row for candidate ${cleanCandidateName} due to missing Recruiter Name`);
        continue;
      }

      if (/^\d+(\.\d+)?$/.test(String(recruiterName).trim())) {
        console.log(`Skipping numeric Recruiter: ${recruiterName}`);
        continue;
      }

      const cleanRecruiterName = String(recruiterName).trim();

      // Find or Create User (Recruiter)
      let user = await prisma.user.findFirst({
        where: { name: { equals: cleanRecruiterName, mode: 'insensitive' } }
      });

      if (cleanCandidateName === 'John Donaldson') {
          console.log(`[DEBUG] John Donaldson Processing:`);
          console.log(`  Raw Recruiter: ${recruiterName}`);
          console.log(`  Clean Recruiter: ${cleanRecruiterName}`);
          console.log(`  Found User: ${user ? user.name + ' (' + user.id + ')' : 'NULL'}`);
      }

      if (!user) {
        // Create dummy user if not exists (using name as email prefix for uniqueness)
        const email = `${cleanRecruiterName.replace(/\s+/g, '.').toLowerCase()}@example.com`;
        user = await prisma.user.create({
          data: {
            name: cleanRecruiterName,
            email: email,
            passwordHash: '$2b$10$EpOddz8zZ8.Z8.Z8.Z8.Z8', // Dummy hash
            role: 'EMPLOYEE'
          }
        });
        console.log(`Created new user: ${cleanRecruiterName}`);
      }

      // Map other fields
      const doj = parseDate(getVal('DOJ'));
      const doq = parseDate(getVal('DOQ'));
      const totalRevenue = parseCurrency(getVal('Total Revenue'));
      const billingStatus = mapBillingStatus(getVal('Billing status'));
      
      const sourcer = getVal('Sourcer') ? String(getVal('Sourcer')).trim() : '-';
      const accountManager = getVal('Account Manager') ? String(getVal('Account Manager')).trim() : '-';
      const teamLead = getVal('TL') ? String(getVal('TL')).trim() : '-';
      
      let placementSharing = getVal('Placement sharing') ? String(getVal('Placement sharing')).trim() : '-';
      if (placementSharing.toLowerCase() === 'split') placementSharing = '0.5';
      if (placementSharing.toLowerCase() === 'individual') placementSharing = '1';

      // placementCredit is Decimal
      const pcVal = getVal('Placement Credit');
      const placementCredit = (pcVal !== null && pcVal !== undefined && pcVal !== '') ? parseCurrency(pcVal) : null;
      
      const revenueAsLead = parseCurrency(getVal('Revenue as Lead'));

      const daysCompleted = getVal('Days Completed') ? parseInt(getVal('Days Completed')) : 0;
      const revQualifierVal = getVal('Revenue Qualifier');
      const qualifier = (revQualifierVal && String(revQualifierVal).trim().toLowerCase() === 'yes');

      // Upsert Placement
      // We identify unique placement by employeeId + candidateName + clientName
      const existingPlacement = await prisma.placement.findFirst({
        where: {
          employeeId: user.id,
          candidateName: { equals: cleanCandidateName, mode: 'insensitive' },
          clientName: { equals: cleanClientName, mode: 'insensitive' }
        }
      });

      const placementData = {
        employeeId: user.id,
        candidateName: cleanCandidateName,
        clientName: cleanClientName,
        // Missing IDs in this file, keep existing or default to '-'
        candidateId: existingPlacement?.candidateId && existingPlacement.candidateId !== '-' ? existingPlacement.candidateId : '-',
        clientId: existingPlacement?.clientId && existingPlacement.clientId !== '-' ? existingPlacement.clientId : '-',
        jpcId: existingPlacement?.jpcId && existingPlacement.jpcId !== '-' ? existingPlacement.jpcId : '-',
        
        doj: doj || new Date(), // DOJ is required in schema unique constraint usually, but here we just need a date
        doq: doq,
        revenue: revenueAsLead || totalRevenue, // Prioritize revenueAsLead for calculation consistency
        totalRevenue: totalRevenue, // Decimal
        billingStatus: billingStatus,
        
        // New L2 Fields
        sourcer: sourcer,
        accountManager: accountManager,
        teamLead: teamLead,
        placementSharing: placementSharing,
        placementCredit: placementCredit,
        revenueAsLead: revenueAsLead,
        
        daysCompleted: daysCompleted || 0,
        
        // Defaults
        placementType: existingPlacement?.placementType || 'PERMANENT',
        marginPercent: existingPlacement?.marginPercent || 0,
        billedHours: existingPlacement?.billedHours || 0,
        incentiveAmountInr: existingPlacement?.incentiveAmountInr || 0,
        qualifier: qualifier, // Use sheet value
        incentivePaid: existingPlacement?.incentivePaid ?? false
      };

      if (existingPlacement) {
        await prisma.placement.update({
          where: { id: existingPlacement.id },
          data: placementData
        });
        updatedCount++;
      } else {
        await prisma.placement.create({
          data: placementData
        });
        createdCount++;
      }

    } catch (err) {
      console.error(`Error processing row ${i}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\nImport Summary:`);
  console.log(`Created: ${createdCount}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Errors: ${errorCount}`);
}

processFile()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
