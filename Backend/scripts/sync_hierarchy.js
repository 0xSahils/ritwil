
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EXCEL_PATH = path.join(__dirname, '../../EMPLOYEE DETAIL.xlsx');
const JSON_PATH = path.join(__dirname, '../hierarchy_data.json');
const LOG_PATH = path.join(__dirname, '../sync_logs.txt');
const REPORT_PATH = path.join(__dirname, '../sync_report.txt');
const MISSING_REPORT_PATH = path.join(__dirname, '../missing_report.txt');
const BACKUP_PATH = path.join(__dirname, `../backups/hierarchy_backup_${Date.now()}.json`);

// Aliases for Name Matching (Excel Name -> JSON Name)
const ALIASES = {
    "sid khosla": "sidhartha khosla",
    "vivek yadav": "vivek yadav" // Ensure exact match works
};

// Logging helper
const logs = [];
function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}`;
    console.log(logEntry);
    logs.push(logEntry);
}

// Main function
async function main() {
    log('Starting JSON synchronization process...');

    try {
        // 1. Backup
        log(`Creating backup at ${BACKUP_PATH}`);
        if (fs.existsSync(JSON_PATH)) {
            fs.copyFileSync(JSON_PATH, BACKUP_PATH);
        } else {
            throw new Error(`JSON file not found at ${JSON_PATH}`);
        }

        // 2. Read Excel
        log(`Reading Excel file from ${EXCEL_PATH}`);
        if (!fs.existsSync(EXCEL_PATH)) {
            throw new Error(`Excel file not found at ${EXCEL_PATH}`);
        }
        const workbook = xlsx.readFile(EXCEL_PATH);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = xlsx.utils.sheet_to_json(sheet);
        
        // Map Excel data
        const excelRecords = [];
        const excelMap = new Map(); // Name -> Record

        excelData.forEach(row => {
            const name = row['Employee Name'];
            if (name) {
                const cleanName = name.trim().toLowerCase();
                const record = {
                    originalName: name.trim(),
                    email: row['Email ID'],
                    vbCode: row['VB Code'],
                    team: row['Team'],
                    lead: row['Team Lead'],
                    matched: false
                };
                excelRecords.push(record);
                excelMap.set(cleanName, record);
            }
        });
        log(`Loaded ${excelRecords.length} records from Excel.`);

        // 3. Read JSON
        const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
        
        // 4. Index JSON
        const stats = {
            totalProcessed: 0,
            updated: 0,
            added: 0,
            notFoundInExcel: 0,
            errors: 0
        };

        const leadMap = new Map(); // Name -> Node
        const teamMap = new Map(); // Name -> Team Node
        const notFoundInExcelList = [];

        function processNode(node) {
            stats.totalProcessed++;
            const name = node.name ? node.name.trim() : null;
            
            if (name) {
                // Index as potential lead
                leadMap.set(name.toLowerCase(), node);

                // Update Logic
                const cleanName = name.toLowerCase();
                if (excelMap.has(cleanName)) {
                    const excelRecord = excelMap.get(cleanName);
                    excelRecord.matched = true;

                    let isUpdated = false;
                    const changes = [];

                    if (excelRecord.email && node.email !== excelRecord.email) {
                        changes.push(`Email: ${node.email} -> ${excelRecord.email}`);
                        node.email = excelRecord.email;
                        isUpdated = true;
                    }

                    if (excelRecord.vbCode && node.vbid !== excelRecord.vbCode) {
                        changes.push(`VBID: ${node.vbid || 'N/A'} -> ${excelRecord.vbCode}`);
                        node.vbid = excelRecord.vbCode;
                        isUpdated = true;
                    }

                    if (isUpdated) {
                        stats.updated++;
                        log(`Updated ${name}: ${changes.join(', ')}`, 'UPDATE');
                    }
                } else {
                    stats.notFoundInExcel++;
                    notFoundInExcelList.push(name);
                }
            }
        }

        function traverse(node) {
            if (node.name) processNode(node);

            if (node.teams) {
                node.teams.forEach(team => {
                    if (team.name) teamMap.set(team.name.trim().toLowerCase(), team);
                    
                    if (team.leads) {
                        team.leads.forEach(lead => {
                            traverse(lead);
                        });
                    }
                });
            } 
            
            // Check members
            if (node.members) {
                node.members.forEach(member => traverse(member));
            }
            // Check subLeads (Crucial for deep hierarchy like Vivek Yadav)
            if (node.subLeads) {
                node.subLeads.forEach(subLead => traverse(subLead));
            }
        }

        if (jsonData.hierarchy) {
            jsonData.hierarchy.forEach(l1 => traverse(l1));
        }

        // Helper: Find Best Match for Lead Name
        function findLeadNode(leadName) {
            if (!leadName) return null;
            let cleanLeadName = leadName.trim().toLowerCase();
            
            // Apply Alias
            if (ALIASES[cleanLeadName]) {
                cleanLeadName = ALIASES[cleanLeadName];
            }

            // 1. Exact match
            if (leadMap.has(cleanLeadName)) return leadMap.get(cleanLeadName);

            // 2. Fuzzy match
            let bestMatch = null;
            let maxScore = 0;

            for (const [key, node] of leadMap.entries()) {
                if (key.includes(cleanLeadName) || cleanLeadName.includes(key)) {
                    const score = Math.min(key.length, cleanLeadName.length) / Math.max(key.length, cleanLeadName.length);
                    if (score > 0.6 && score > maxScore) { 
                        maxScore = score;
                        bestMatch = node;
                    }
                }
            }
            return bestMatch;
        }

        // 5. Add Missing Employees
        log('Checking for missing employees to add...');
        
        for (const record of excelRecords) {
            if (!record.matched) {
                const leadName = record.lead;
                const teamName = record.team;
                const isLeadSelf = leadName && record.originalName.toLowerCase() === leadName.toLowerCase();

                let added = false;

                // Case A: Missing Person is a Lead (Self-reference or designated)
                if (isLeadSelf) {
                     // Add to Team
                     if (teamName && teamMap.has(teamName.toLowerCase())) {
                         const teamNode = teamMap.get(teamName.toLowerCase());
                         if (!teamNode.leads) teamNode.leads = [];
                         
                         const newLead = {
                             name: record.originalName,
                             email: record.email,
                             level: 'L2',
                             vbid: record.vbCode,
                             members: []
                         };
                         teamNode.leads.push(newLead);
                         // Index the new lead
                         leadMap.set(newLead.name.toLowerCase(), newLead);
                         
                         added = true;
                         log(`Added NEW LEAD ${newLead.name} to Team ${teamNode.name}`, 'ADD');
                     } else {
                         log(`SKIPPED LEAD: ${record.originalName}. Team '${teamName}' not found.`, 'WARN');
                     }
                } 
                // Case B: Missing Person is a Member
                else {
                    const leadNode = findLeadNode(leadName);
                    
                    if (leadNode) {
                        if (!leadNode.members) leadNode.members = [];
                        
                        const newNode = {
                            name: record.originalName,
                            email: record.email,
                            level: 'L4',
                            vbid: record.vbCode
                        };
                        leadNode.members.push(newNode);
                        added = true;
                        log(`Added ${newNode.name} to Lead ${leadNode.name}`, 'ADD');
                    } else {
                        log(`SKIPPED: ${record.originalName}. Lead '${leadName}' not found (Fuzzy search failed).`, 'WARN');
                    }
                }

                if (added) {
                    record.matched = true;
                    stats.added++;
                }
            }
        }

        // 6. Save Updated JSON
        log('Saving updated JSON...');
        fs.writeFileSync(JSON_PATH, JSON.stringify(jsonData, null, 2));

        // 7. Generate Reports
        const notFoundInJsonList = excelRecords.filter(r => !r.matched).map(r => `${r.originalName} (Lead: ${r.lead})`);

        const report = `
Synchronization Report
======================
Date: ${new Date().toLocaleString()}
Total Nodes in JSON Processed: ${stats.totalProcessed}
Successfully Updated (JSON): ${stats.updated}
Successfully Added (New): ${stats.added}
Nodes in JSON but NOT in Excel: ${stats.notFoundInExcel}
Records in Excel still NOT in JSON (Orphans): ${notFoundInJsonList.length}

Logs:
${logs.join('\n')}
        `;
        fs.writeFileSync(REPORT_PATH, report);
        fs.writeFileSync(LOG_PATH, logs.join('\n'));

        const missingReport = `
Missing Data Report
===================
Date: ${new Date().toLocaleString()}

1. Employees in JSON but NOT in Excel (${notFoundInExcelList.length}):
   (These exist in current Hierarchy but were not found in the Excel sheet)
   -------------------------------------------------------------
   ${notFoundInExcelList.join('\n   ')}

2. Employees in Excel NOT added to JSON (${notFoundInJsonList.length}):
   (These could not be added because their Team/Lead was not found)
   -------------------------------------------------------------
   ${notFoundInJsonList.join('\n   ')}
        `;
        fs.writeFileSync(MISSING_REPORT_PATH, missingReport);

        log(`Process finished. Reports generated at:
        - ${REPORT_PATH}
        - ${MISSING_REPORT_PATH}`);

    } catch (error) {
        log(`CRITICAL ERROR: ${error.message}`, 'ERROR');
        console.error(error);
    }
}

main();
