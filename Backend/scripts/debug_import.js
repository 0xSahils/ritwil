
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function debug() {
    try {
        const files = ['../../L2 Vantage.xlsx', '../../vantege.xlsx'];
        
        for (const file of files) {
            const filePath = path.resolve(__dirname, file);
            if (!fs.existsSync(filePath)) {
                console.log(`\nFile not found: ${filePath}`);
                continue;
            }
            
            console.log(`\n\n========== Reading file: ${file} ==========`);
            const workbook = XLSX.readFile(filePath);
            console.log(`Sheets: ${workbook.SheetNames.join(', ')}`);
            
            for (const sheetName of workbook.SheetNames) {
                console.log(`\n  --- Sheet: ${sheetName} ---`);
                const sheet = workbook.Sheets[sheetName];
                // Read rows 0 to 10
                const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, range: 0, raw: false });
                
                // Find the header row (row containing "Candidate Name")
                const headerRowIndex = data.findIndex(row => row && row.includes('Candidate Name'));
                if (headerRowIndex !== -1) {
                    console.log(`\n    FOUND HEADER ROW AT INDEX ${headerRowIndex}`);
                    console.log(`    Headers: ${JSON.stringify(data[headerRowIndex])}`);
                    
                    const headers = data[headerRowIndex];
                    const colMap = {};
                    headers.forEach((h, i) => {
                        if (h) colMap[String(h).trim()] = i;
                    });
                    
     // Find ALL John Donaldson rows
     const johnRows = data.filter(row => row && row[1] === 'John Donaldson');
     if (johnRows.length > 0) {
         console.log(`--- John Donaldson Rows Found: ${johnRows.length} ---`);
         johnRows.forEach((johnRow, i) => {
             console.log(`\nRow ${i+1}:`, JSON.stringify(johnRow));
             const recruiterVal = johnRow[colMap['Recruiter']];
             const recruiterNameVal = johnRow[colMap['Recruiter Name']];
             const finalRecruiter = recruiterVal || recruiterNameVal;
             console.log('Recruiter Col:', recruiterVal);
             console.log('Recruiter Name Col:', recruiterNameVal);
             console.log('Resolved Recruiter Name:', finalRecruiter);
         });
     }
                } else {
                    console.log(`\n    COULD NOT FIND "Candidate Name" in first 10 rows`);
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
