
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function checkDB() {
    try {
        const users = await prisma.user.findMany({
            where: { name: 'Ranjeet Kumar' },
            include: { employeeProfile: true }
        });
        console.log('Users in DB:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkDB();
