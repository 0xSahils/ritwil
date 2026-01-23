
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../../other teams .xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
console.log("Sheet Names:", workbook.SheetNames);
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
console.log("Total Rows:", rows.length);

console.log("Rows 40-60:");
for (let i = 40; i < Math.min(rows.length, 60); i++) {
    console.log(`Row ${i}:`, rows[i]);
}
