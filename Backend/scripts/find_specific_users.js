import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const names = ['Harinath', 'Vinoth', 'Mayank']
  
  for (const name of names) {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: name,
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
    
    console.log(`Results for ${name}:`)
    users.forEach(u => {
      console.log(`${u.name} (${u.email}) - Role: ${u.role}, Level: ${u.employeeProfile?.level}, Team: ${u.employeeProfile?.team?.name}`)
    })
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
