import { PrismaClient, PlacementType, BillingStatus } from '@prisma/client'

const prisma = new PrismaClient()

const rawData = `Abilash Subramaniam 	 10/7/2025 	 Tredence 	 0 	 Active 	 NA 	 Contract 	 M Harinath 	 Mayank Saxena 	 Vinoth L 	 0 	 9 	 115 	 Split 	 0.5 	 0 	 Yes 
 Surendar Kumar Amduri 	 10/20/2025 	 Citius Tech 	 0 	 Active 	 NA 	 Contract 	 Dasive Prakash S 	 Vinoth L 	 Akbar Ibrahim 	 0 	 5 	 102 	 Split 	 0.5 	 0 	 Yes 
 Ashish Garg 	 1/27/2025 	 Tredence 	 14000 	 Done 	 NA 	 FTE 	 M Harinath 	 Mayank Saxena 	 Vinoth L 	 NA 	 NA 	 368 	 Split 	 0 	 0 	 Yes 
 Kaleemullah Brohi 	 2/3/2025 	 Tredence 	 12400 	 Done 	 NA 	 FTE 	 Dinesh Veluchamy 	 Mayank Saxena 	 Vinoth L 	 NA 	 NA 	 361 	 Split 	 0.5 	 6200 	 Yes 
 David Richter 	 2/10/2025 	 Relevante 	 4200 	 Pending 	 NA 	 FTE 	 Archana K 	 Vinoth L 	 Akbar I 	 NA 	 NA 	 354 	 Split 	 0.5 	 2100 	 NO 
 Yogendra Gijare 	 3/10/2025 	 Tredence 	 13600 	 Done 	 NA 	 FTE 	 M Harinath 	 Mayank Saxena 	 Vinoth L 	 NA 	 NA 	 326 	 Split 	 0.5 	 6800 	 Yes 
 Jodi Homaune 	 3/10/2025 	 Relevante 	 4515 	 Pending 	 NA 	 FTE 	 Ajith Gunasekar 	 Vinoth L 	 Akbar I 	 NA 	 NA 	 326 	 Split 	 0.5 	 2257.5 	 NO 
 Scot Shields 	 6/9/2025 	 Tredence 	 16800 	 Done 	 NA 	 FTE 	 M Harinath 	 Mayank Saxena 	 Vinoth L 	 NA 	 NA 	 235 	 Split 	 0.5 	 8400 	 Yes 
 Phanichander Katakam 	 6/16/2025 	 Apexon 	 2000 	 Pending 	 NA 	 FTE 	 M Harinath 	 Vinoth L 	 Vinoth L 	 NA 	 NA 	 228 	 Individual 	 1 	 2000 	 NO 
 Kishore Babu Tenneti 	 9/3/2025 	 Tredence 	 12400 	 Pending 	 NA 	 FTE 	 M Harinath 	 Mayank Saxena 	 Vinoth L 	 NA 	 NA 	 149 	 Split 	 0.5 	 6200 	 NO 
 Taylor Fink 	 10/1/2025 	 Relevante 	 4200 	 Pending 	 NA 	 FTE 	 Ajith Gunasekar 	 Vinoth L 	 Akbar I 	 NA 	 NA 	 121 	 Split 	 0.5 	 2100 	 NO 
 Giga Songulashvil 	 10/27/2025 	 Apexon 	 2500 	 Pending 	 NA 	 FTE 	 M Harinath 	 Vinoth L 	 Vinoth L 	 NA 	 NA 	 95 	 Individual 	 1 	 2500 	 NO`

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'NA') return new Date(); // Default to now if missing? Or null? Schema says DOJ is DateTime (Required).
  const [month, day, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`);
}

function parseCurrency(str) {
  if (!str || str === 'NA') return 0;
  return parseFloat(str.replace(/[^0-9.-]+/g, "")) || 0;
}

function cleanString(str) {
  if (!str) return null;
  const s = str.trim();
  if (s === 'NA' || s === '0') return null;
  return s;
}

async function main() {
  const targetEmail = 'vinoth.l@vbeyond.com';
  const user = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  if (!user) {
    console.error(`User ${targetEmail} not found!`);
    process.exit(1);
  }

  console.log(`Importing data for user: ${user.name} (${user.id})`);

  const rows = rawData.split('\n').filter(r => r.trim());

  for (const row of rows) {
    // Split by tab or multiple spaces
    // The input seems to be tab separated or aligned with spaces.
    // I'll try regex to split by 2 or more spaces or tabs.
    const cols = row.trim().split(/\t|\s{2,}/).map(c => c.trim());

    if (cols.length < 10) {
        console.warn('Skipping invalid row:', row);
        continue;
    }

    // Mapping based on analysis
    // 0: Candidate Name
    // 1: DOJ
    // 2: Client
    // 3: Total Revenue
    // 4: Billing Status
    // 5: DOQ
    // 6: Placement Type
    // 7: Recruiter
    // 8: Sourcer
    // 9: Account Manager
    // 10: TL
    // 11: ??? (Ignored)
    // 12: Days Completed (If cols length is large)
    // 13: Placement Sharing
    // 14: Placement Credit
    // 15: Revenue As Lead
    // 16: Revenue Qualifier

    // Adjust indices if col 11/12 are weird.
    // Let's assume the columns are consistent.
    // If I split by multiple spaces, "M Harinath" might be kept as one token.
    
    const candidateName = cols[0];
    const dojStr = cols[1];
    const clientName = cols[2];
    const totalRevenue = parseCurrency(cols[3]);
    const billingStatusStr = cols[4];
    const doqStr = cols[5];
    const typeStr = cols[6];
    const recruiter = cols[7];
    const sourcer = cols[8];
    const accountManager = cols[9];
    const teamLead = cols[10]; // This might be "0" or "NA"
    
    // Check if we have enough columns for the rest
    // We expect around 17 cols.
    // Index 12 is "Days Completed" (based on 115, 368 etc)
    // Index 11 is the mystery column (9, 5, NA)
    
    const daysCompleted = parseInt(cols[12]) || 0;
    const placementSharing = cols[13];
    const placementCredit = parseCurrency(cols[14]);
    const revenueAsLead = parseCurrency(cols[15]);
    const qualifierStr = cols[16];

    // Mappings
    const placementType = typeStr.toLowerCase().includes('fte') ? PlacementType.PERMANENT : PlacementType.CONTRACT;
    
    let billingStatus = BillingStatus.PENDING;
    const bs = billingStatusStr.toLowerCase();
    if (bs === 'done' || bs === 'billed') billingStatus = BillingStatus.BILLED;
    else if (bs === 'pending') billingStatus = BillingStatus.PENDING;
    else if (bs === 'active') billingStatus = BillingStatus.PENDING; // Map Active to Pending
    
    const qualifier = qualifierStr && qualifierStr.toLowerCase() === 'yes';

    const doj = parseDate(dojStr);
    const doq = doqStr !== 'NA' ? parseDate(doqStr) : null;

    console.log(`Processing: ${candidateName} - ${clientName} (${doj.toISOString().slice(0,10)})`);

    const data = {
        employeeId: user.id,
        candidateName,
        clientName,
        doj,
        totalRevenue,
        billingStatus,
        doq,
        placementType,
        recruiter, // New field
        sourcer: cleanString(sourcer),
        accountManager: cleanString(accountManager),
        teamLead: cleanString(teamLead),
        daysCompleted,
        placementSharing: cleanString(placementSharing),
        placementCredit,
        revenueAsLead,
        qualifier,
        // Defaults
        revenue: 0, // Should this be totalRevenue? Or revenueAsLead?
                   // Usually 'revenue' is the main field shown in tables.
                   // If this is a Lead sheet, maybe revenueAsLead?
                   // But let's set 'revenue' to totalRevenue for now, or 0 if not relevant.
                   // EmployeeDetails uses 'revenueGenerated' which comes from 'p.revenue'.
                   // So I should set 'revenue' to 'revenueAsLead' if this is for the Lead?
                   // Or 'totalRevenue'?
                   // Let's set 'revenue' to 'revenueAsLead' since this is likely the Lead's dashboard.
                   // And 'totalRevenue' is stored in 'totalRevenue'.
        revenue: revenueAsLead, 
        marginPercent: 0,
        incentiveAmountInr: 0,
        incentivePaid: false
    };

    // Upsert
    // Unique constraint: [employeeId, candidateName, clientName, doj]
    await prisma.placement.upsert({
        where: {
            employeeId_candidateName_clientName_doj: {
                employeeId: user.id,
                candidateName,
                clientName,
                doj
            }
        },
        update: data,
        create: data
    });
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
