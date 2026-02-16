import prisma from '../src/prisma.js';

async function disableMFA() {
  try {
    const email = 'admin@vbeyond.com';
    
    console.log(`Disabling MFA for user: ${email}`);
    
    const result = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
      },
    });
    
    console.log('✅ MFA disabled successfully!');
    console.log(`User: ${result.name} (${result.email})`);
    console.log(`MFA Enabled: ${result.mfaEnabled}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error disabling MFA:', error.message);
    
    if (error.code === 'P2025') {
      console.error(`User with email ${email} not found.`);
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

disableMFA();
