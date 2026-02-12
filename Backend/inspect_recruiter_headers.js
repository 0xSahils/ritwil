import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check multiple recruiter sheets
const filesToCheck = [
    'csk recruitors.xlsx',
    'WWH recuitors.xlsx',
    'mavericks recruitors.xlsx',
    'titans recuitors.xlsx',
    'akbar imbharhim l2.xlsx',
    'csk l2 vinoth L.xlsx'
];

filesToCheck.forEach(fileName => {
    const excelPath = path.join(__dirname, '..', fileName);
    console.log(`\n--- Inspecting: ${fileName} ---`);
    try {
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Get headers (first row)
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        if (data.length > 0) {
            console.log('Headers found:');
            console.log(JSON.stringify(data[0], null, 2));
            
            // Check for specific fields the user mentioned
            const headers = data[0].map(h => String(h).toLowerCase().trim());
            const fieldsToLookFor = ['revenue target', 'revenue ach', 'revenue target achieved %'];
            fieldsToLookFor.forEach(field => {
                if (headers.some(h => h.includes(field))) {
                    console.log(`[!] Found potential match for: ${field}`);
                }
            });
        } else {
            console.log('Excel file is empty');
        }
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error.message);
    }
});
