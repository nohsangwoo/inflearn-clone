const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const lectures = await prisma.lecture.findMany({
    select: { id: true, title: true }
  })
  console.log('Available lectures:')
  lectures.forEach(l => console.log(`ID: ${l.id}, Title: ${l.title}`))

  const lecture11 = await prisma.lecture.findUnique({
    where: { id: 11 }
  })

  if (!lecture11) {
    console.log('\nLecture with ID 11 does not exist!')
  } else {
    console.log('\nLecture 11 found:', lecture11.title)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())