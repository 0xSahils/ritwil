import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient({
    log: ['error']
});

export default prisma;
