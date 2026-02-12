
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../src/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../../../CSK L4.xlsx');

// Excel Date to JS Date
function excelDateToJSDate(serial) {
    if (!serial || isNaN(serial)) return null;
    // Excel base date: Dec 30 1899
    // Unix epoch: Jan 1 1970
    // Diff: 25569 days
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
}

function parseCurrency(val) {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    const clean = String(val).replace(/[^0-9.-]/g, '');
    return Number(clean) || 0;
}

function mapPlacementType(type) {
    if (!type) return "PERMANENT";
    const t = String(type).toUpperCase().trim();
    if (t === "CONTRACT" || t === "TEMPORARY" || t === "C2H") return "CONTRACT";
    return "PERMANENT";
}

function mapBillingStatus(status) {
    if (!status) return "PENDING";
    const s = String(status).toUpperCase().trim();
    if (["PENDING", "BILLED", "CANCELLED", "HOLD"].includes(s)) return s;
    if (s === "DONE" || s === "ACTIVE" || s === "COMPLETED") return "BILLED";
    if (s === "CANCELED") return "CANCELLED";
    if (s === "ON HOLD") return "HOLD";
    return "PENDING";
}

async function main() {
    try {
        console.log(`Reading file from: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`Total rows: ${data.length}`);

        let currentVbid = null;
        let currentUserId = null;
        let updatedProfiles = 0;
        let updatedPlacements = 0;
        let errors = [];

        // Pre-fetch teams and users to optimize
        const teams = await prisma.team.findMany();
        console.log(`Loaded ${teams.length} teams.`);
        const teamMap = new Map(teams.map(t => [t.name.trim().toLowerCase(), t.id]));
        
        const users = await prisma.user.findMany({ select: { id: true, name: true, vbid: true } });
        console.log(`Loaded ${users.length} users.`);
        const userMapName = new Map(users.map(u => [u.name.trim().toLowerCase(), u.id]));

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;
            
            // Debug first few rows
            if (i < 5) console.log(`Row ${i} [0]: ${row[0]}`);

            // 1. Check for Metrics Header / Block Start
            if (row[0] === 'Team' && row[1] === 'VB Code') {
                // The NEXT row (i+1) is the Metrics Data
                const metricsRow = data[i+1];
                if (!metricsRow) continue;

                const vbid = metricsRow[1];
                if (!vbid) {
                    console.log(`Row ${i+1}: Missing VBID, skipping block.`);
                    continue;
                }

                currentVbid = String(vbid).trim();
                
                // Find User by VBID
                const user = await prisma.user.findFirst({
                    where: { 
                        OR: [
                            { vbid: currentVbid },
                            { employeeProfile: { vbid: currentVbid } }
                        ]
                    },
                    include: { employeeProfile: true }
                });

                if (!user) {
                    console.log(`Row ${i+1}: User with VBID ${currentVbid} not found.`);
                    currentUserId = null;
                    continue;
                }

                currentUserId = user.id;

                // --- Update Metrics (Profile) ---
                // Mapping:
                // 0: Team ("CSK")
                // 1: VB Code ("VB1525")
                // 2: Recruiter Name ("R Richardson")
                // 3: Team Lead ("Vinoth L")
                // 4: Yearly Placement Target (4)
                // 5: Placement Done
                // 6: Target Achieved %
                // 7: Total Revenue Generated (USD)
                // 8: Slab qualified
                // 9: Total Incentive in INR
                // 10: Total Incentive in INR (Paid) (If present)
                
                const teamName = metricsRow[0];
                const managerName = metricsRow[3];
                const yearlyPlacementTarget = metricsRow[4];
                const placementsDone = metricsRow[5];
                const targetAchievementStatus = metricsRow[6];
                const totalRevenue = metricsRow[7];
                const slabQualified = metricsRow[8];
                const totalIncentiveAmount = metricsRow[9];
                const totalIncentivePaid = metricsRow[10]; // Assuming it's column 10 now

                const updateData = {};
                
                // Update Team
                if (teamName) {
                    const tName = String(teamName).trim().toLowerCase();
                    if (teamMap.has(tName)) updateData.teamId = teamMap.get(tName);
                }

                // Update Manager
                if (managerName) {
                    const mName = String(managerName).trim().toLowerCase();
                    if (userMapName.has(mName)) updateData.managerId = userMapName.get(mName);
                }

                if (yearlyPlacementTarget !== undefined) updateData.yearlyPlacementTarget = parseCurrency(yearlyPlacementTarget);
                if (placementsDone !== undefined) updateData.placementsDone = parseInt(parseCurrency(placementsDone));
                if (targetAchievementStatus !== undefined) updateData.targetAchievementStatus = String(targetAchievementStatus);
                if (totalRevenue !== undefined) updateData.totalRevenue = parseCurrency(totalRevenue);
                if (slabQualified !== undefined) updateData.slabQualified = String(slabQualified);
                if (totalIncentiveAmount !== undefined) updateData.totalIncentiveAmount = parseCurrency(totalIncentiveAmount);
                if (totalIncentivePaid !== undefined) updateData.totalIncentivePaid = parseCurrency(totalIncentivePaid);

                if (Object.keys(updateData).length > 0) {
                    console.log(`Updating profile for ${currentVbid}`);
                    await prisma.employeeProfile.update({
                        where: { id: user.employeeProfile.id },
                        data: updateData
                    });
                    updatedProfiles++;
                }

                i++; 
                continue;
            }

            // 2. Check for Placement Data
            // We know we are in a block if we have currentUserId
            // And if the row is NOT a header row (we handled 'Team' header above)
            // But we also need to skip the "Recruiter Name" header row
            
            if (row[0] === 'Recruiter Name' && row[1] === 'Candidate Name') {
                continue; // Skip placement header
            }

            if (currentUserId) {
                // Process Placement Row
                // Ensure it's not a new block start (redundant check but safe)
                if (row[0] === 'Team') {
                    // This should be caught by the first if, but just in case logic overlaps
                    currentUserId = null; 
                    continue; 
                }

                // Columns:
                // 0: Recruiter Name
                // 1: Candidate Name
                // 2: Placement Year
                // 3: DOJ
                // 4: DOQ
                // 5: Client
                // 6: PLC ID
                // 7: Placement Type
                // 8: Billing Status
                // 9: Collection Status
                // 10: Total Billed Hours
                // 11: Revenue (USD)
                // 12: Incentive amount (INR)
                // 13: Incentive Paid (INR)

                const candidateName = row[1];
                if (!candidateName) continue; // Skip empty rows

                const placementYear = row[2];
                const dojSerial = row[3];
                const doqSerial = row[4];
                const clientName = row[5];
                const plcId = row[6];
                const pType = row[7];
                const bStatus = row[8];
                const cStatus = row[9];
                const billedHours = row[10];
                const revenue = row[11];
                const incAmount = row[12];
                const incPaid = row[13];

                const doj = excelDateToJSDate(dojSerial);
                
                if (!clientName || !doj) {
                    if (i % 50 === 0) console.log(`Row ${i}: Skipping placement (Missing Client/DOJ)`);
                    continue;
                }

                const placementData = {
                    employeeId: currentUserId,
                    candidateName: String(candidateName).trim(),
                    placementYear: placementYear ? Number(placementYear) : null,
                    doj: doj,
                    doq: excelDateToJSDate(doqSerial),
                    clientName: String(clientName).trim(),
                    plcId: plcId ? String(plcId).trim() : null,
                    placementType: mapPlacementType(pType),
                    billingStatus: mapBillingStatus(bStatus),
                    collectionStatus: cStatus ? String(cStatus) : null,
                    billedHours: billedHours ? Number(billedHours) : null,
                    revenue: parseCurrency(revenue),
                    incentiveAmountInr: parseCurrency(incAmount),
                    incentivePaidInr: parseCurrency(incPaid),
                    // Default/Missing fields
                    incentivePayoutEta: null,
                };

                // Upsert Placement
                try {
                    if (i % 50 === 0) console.log(`Row ${i}: Upserting placement for ${candidateName}`);
                    await prisma.placement.upsert({
                        where: {
                            employeeId_candidateName_clientName_doj: {
                                employeeId: currentUserId,
                                candidateName: placementData.candidateName,
                                clientName: placementData.clientName,
                                doj: placementData.doj
                            }
                        },
                        update: placementData,
                        create: placementData
                    });
                    updatedPlacements++;
                } catch (err) {
                    console.error(`Failed to upsert placement for ${candidateName}: ${err.message}`);
                    errors.push({ row: i, error: err.message });
                }
            }
        }

        console.log("=== Processing Complete ===");
        console.log(`Updated Profiles: ${updatedProfiles}`);
        console.log(`Updated/Created Placements: ${updatedPlacements}`);
        if (errors.length > 0) {
            console.log(`Errors: ${errors.length}`);
        }

    } catch (error) {
        console.error("Critical Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
