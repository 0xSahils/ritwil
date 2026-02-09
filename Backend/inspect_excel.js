
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to point to root where excel file is
const excelPath = path.join(__dirname, '../EMPLOYEE DETAIL.xlsx');

try {
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Get headers (first row)
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (data.length > 0) {
        console.log('Headers:', data[0]);
        console.log('First row data:', data[1]);
    } else {
        console.log('Excel file is empty');
    }
} catch (error) {
    console.error('Error reading excel:', error);
}
