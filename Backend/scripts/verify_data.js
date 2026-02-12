import prisma from '../src/prisma.js';

async function main() {
  console.log('Verifying uploaded data...\n');
  
  // Check Abhay Pratap Singh (from vantege recruitor.xlsx)
  const abhay = await prisma.employeeProfile.findFirst({
    where: { user: { name: { contains: 'Abhay' } } },
    include: { user: true }
  });
  
  if (abhay) {
    console.log('✓ Found: Abhay Pratap Singh');
    console.log('  Yearly Target:', abhay.yearlyTarget);
    console.log('  Yearly Placement Target:', abhay.yearlyPlacementTarget);
    console.log('  Placements Done:', abhay.placementsDone);
    console.log('  Total Revenue:', abhay.totalRevenue);
    
    const placements = await prisma.personalPlacement.findMany({
      where: { employeeId: abhay.id },
      take: 3
    });
    console.log(`  Placements: ${placements.length} found`);
    if (placements.length > 0) {
      console.log('  First Placement Summary:');
      console.log('    Yearly Placement Target:', placements[0].yearlyPlacementTarget);
      console.log('    Placement Done:', placements[0].placementDone);
      console.log('    Total Revenue Generated:', placements[0].totalRevenueGenerated);
      console.log('    Slab Qualified:', placements[0].slabQualified);
    }
  } else {
    console.log('❌ Abhay not found');
  }
  
  console.log('\n---\n');
  
  // Check Mayank Saxena (from vantenge l2 sheet.xlsx)
  const mayank = await prisma.employeeProfile.findFirst({
    where: { user: { name: { contains: 'Mayank' } } },
    include: { user: true }
  });
  
  if (mayank) {
    console.log('✓ Found: Mayank Saxena');
    console.log('  Yearly Target:', mayank.yearlyTarget);
    console.log('  Yearly Placement Target:', mayank.yearlyPlacementTarget);
    console.log('  Yearly Revenue Target:', mayank.yearlyRevenueTarget);
    console.log('  Placements Done:', mayank.placementsDone);
    
    const placements = await prisma.teamPlacement.findMany({
      where: { leadId: mayank.id },
      take: 3
    });
    console.log(`  Team Placements: ${placements.length} found`);
    if (placements.length > 0) {
      console.log('  First Placement Summary:');
      console.log('    Yearly Placement Target:', placements[0].yearlyPlacementTarget);
      console.log('    Yearly Revenue Target:', placements[0].yearlyRevenueTarget);
      console.log('    Total Revenue Generated:', placements[0].totalRevenueGenerated);
    }
  } else {
    console.log('❌ Mayank not found');
  }
  
  console.log('\n---\n');
  console.log('Verification complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
