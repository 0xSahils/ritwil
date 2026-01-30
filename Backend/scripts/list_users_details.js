import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      employeeProfile: {
        include: {
          team: true
        }
      }
    }
  })

  console.log('Found users:', users.length)
  users.forEach(u => {
    const p = u.employeeProfile
    if (p) {
        console.log(`${u.name} (${u.email}) - Team: ${p.team?.name}, Level: ${p.level}`)
    } else {
        console.log(`${u.name} (${u.email}) - No Profile`)
    }
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
