import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: 'MIDLEVEL',
        mode: 'insensitive'
      }
    },
    include: {
      employeeProfile: {
        include: {
          team: true
        }
      }
    }
  })
  
  console.log(`Results for MIDLEVEL:`)
  users.forEach(u => {
    console.log(`${u.name} (${u.email}) - Role: ${u.role}, Level: ${u.employeeProfile?.level}`)
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
