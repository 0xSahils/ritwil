
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to point to root folder where vantege.xlsx is located
// Script is in Backend/scripts/, so root is ../../
const filePath = path.join(__dirname, '../../vantege.xlsx');

console.log(`Attempting to read file: ${filePath}`);

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    console.log(`Successfully read workbook. Sheet found: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    // detailed: true allows us to see cell addresses if needed, but simple array is better for demo
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    console.log(`Total Rows in Sheet: ${data.length}`);
    console.log('--------------------------------------------------');
    console.log('Preview of first 20 rows to understand structure:');
    console.log('--------------------------------------------------');

    for (let i = 0; i < Math.min(data.length, 20); i++) {
        console.log(`Row ${i}:`, JSON.stringify(data[i]));
    }

    console.log('--------------------------------------------------');
    console.log('Attempting to parse data using standard logic...');
    console.log('--------------------------------------------------');

    // Simplified parsing logic to demonstrate extraction
    let currentRecruiter = null;
    let headersFound = false;
    let cols = {};

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        const firstCell = String(row[0]).trim();
        const secondCell = String(row[1]).trim();

        // 1. Check for Team/Recruiter Block
        if (firstCell.startsWith('Team')) {
             console.log(`[Line ${i}] Found Team Header Block`);
             // Often Recruiter Name is in this row or next. 
             // Let's look for "Recruiter Name" column in this row
             row.forEach((cell, idx) => {
                 if (String(cell).trim() === 'Recruiter Name') {
                     console.log(`[Line ${i}] Identified 'Recruiter Name' column at index ${idx}`);
                 }
             });
        }

        // 2. Check for Main Headers (Candidate Name, etc.)
        // Common headers: Recruiter Name, Candidate Name, DOJ, etc.
        if (!headersFound && (
            (firstCell === 'Recruiter Name' && secondCell === 'Candidate Name') ||
            row.some(cell => String(cell).includes('Candidate Name'))
        )) {
            console.log(`[Line ${i}] Found DATA HEADERS: ${JSON.stringify(row)}`);
            headersFound = true;
            
            // Map columns
            row.forEach((cell, idx) => {
                const val = String(cell).trim().toLowerCase();
                if (val.includes('candidate name')) cols.candidateName = idx;
                if (val.includes('doj')) cols.doj = idx;
                if (val.includes('client')) cols.client = idx;
                if (val.includes('revenue')) cols.revenue = idx;
                if (val.includes('recruiter')) cols.recruiterName = idx;
            });
            console.log(`[Line ${i}] Mapped Columns:`, cols);
            continue;
        }

        // 3. Extract Data if Headers found
        if (headersFound) {
            // Check if this is a valid data row (e.g. has candidate name)
            const candidateName = cols.candidateName !== undefined ? row[cols.candidateName] : null;
            
            if (candidateName && candidateName !== 'Candidate Name' && String(candidateName).trim() !== '') {
                 const recruiter = cols.recruiterName !== undefined ? row[cols.recruiterName] : currentRecruiter;
                 const doj = cols.doj !== undefined ? row[cols.doj] : 'N/A';
                 const client = cols.client !== undefined ? row[cols.client] : 'N/A';
                 const revenue = cols.revenue !== undefined ? row[cols.revenue] : 'N/A';

                 console.log(`[Line ${i}] Parsed Placement -> Recruiter: ${recruiter}, Candidate: ${candidateName}, Client: ${client}, Revenue: ${revenue}`);
            }
        }
    }

} catch (error) {
    console.error("Error reading or parsing file:", error.message);
}
