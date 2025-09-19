const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const lecture = await prisma.lecture.findUnique({
    where: { id: 11 },
    include: {
      Curriculums: {
        include: {
          CurriculumSections: {
            orderBy: { id: "asc" },
            include: {
              Videos: {
                include: {
                  DubTrack: {
                    where: { status: "ready" }
                  }
                }
              },
              Files: true
            }
          }
        }
      }
    }
  })

  if (!lecture) {
    console.log('Lecture not found!')
    return
  }

  console.log('Lecture:', lecture.title)
  console.log('Number of Curriculums:', lecture.Curriculums.length)

  lecture.Curriculums.forEach((curriculum, cIdx) => {
    console.log(`\nCurriculum ${cIdx + 1} (ID: ${curriculum.id})`)
    console.log('  Sections:', curriculum.CurriculumSections.length)

    curriculum.CurriculumSections.forEach((section, sIdx) => {
      console.log(`    Section ${sIdx + 1}: ${section.title} (ID: ${section.id})`)
      console.log(`      Active: ${section.isActive}`)
      console.log(`      Videos: ${section.Videos.length}`)
      console.log(`      Files: ${section.Files.length}`)

      if (section.Videos.length > 0) {
        section.Videos.forEach((video, vIdx) => {
          console.log(`        Video ${vIdx + 1}: ${video.title || 'Untitled'} (ID: ${video.id})`)
          console.log(`          DubTracks: ${video.DubTrack.length}`)
          video.DubTrack.forEach(track => {
            console.log(`            - ${track.lang}: ${track.status}`)
          })
        })
      }
    })
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())