
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const rootDir = 'c:/Users/sahil/OneDrive/Desktop/ritwil';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.xlsx'));

console.log(`Found ${files.length} Excel files to analyze.\n`);

const analysis = {};

files.forEach(file => {
    console.log(`Analyzing: ${file}`);
    try {
        const workbook = xlsx.readFile(path.join(rootDir, file));
        analysis[file] = {
            sheets: workbook.SheetNames.map(name => {
                const sheet = workbook.Sheets[name];
                const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
                const headers = data[0] || [];
                const sampleRows = data.slice(1, 4);
                return {
                    name,
                    headers: headers.map(h => String(h || '').trim().toLowerCase()),
                    rowCount: data.length,
                    sampleRows
                };
            })
        };
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
});

fs.writeFileSync('c:/Users/sahil/OneDrive/Desktop/ritwil/Backend/sheet_analysis_report.json', JSON.stringify(analysis, null, 2));
console.log('\nAnalysis complete. Report saved to Backend/sheet_analysis_report.json');
