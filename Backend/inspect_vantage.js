
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
    'vantege recruitor.xlsx',
    'vantenge l2 sheet.xlsx',
    'akbar l2.xlsx',
    'CSK L4.xlsx'
];

files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    console.log(`\n--- Inspecting: ${file} ---`);
    try {
        const workbook = xlsx.readFile(filePath);
        workbook.SheetNames.forEach(sheetName => {
            console.log(`\nSheet: ${sheetName}`);
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
            if (data.length > 0) {
                console.log('Headers:', data[0]);
                if (data.length > 1) {
                    console.log('Sample Row:', data[1]);
                }
            } else {
                console.log('Empty sheet');
            }
        });
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
});
