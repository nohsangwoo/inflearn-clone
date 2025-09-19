const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const lecture = await prisma.lecture.findUnique({
    where: { id: 11 },
    include: {
      Curriculums: {
        include: {
          CurriculumSections: {
            include: {
              Videos: true,
              Files: true
            }
          }
        }
      }
    }
  })

  if (!lecture) {
    console.log('Lecture 11 not found!')
    return
  }

  console.log('Lecture 11:', lecture.title)
  console.log('Number of Curriculums:', lecture.Curriculums.length)

  if (lecture.Curriculums.length > 0) {
    const curriculum = lecture.Curriculums[0]
    console.log('First Curriculum ID:', curriculum.id)
    console.log('Number of Sections:', curriculum.CurriculumSections.length)

    curriculum.CurriculumSections.forEach((section, idx) => {
      console.log(`  Section ${idx + 1}: ${section.title}`)
      console.log(`    Videos: ${section.Videos.length}`)
      console.log(`    Files: ${section.Files.length}`)
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())