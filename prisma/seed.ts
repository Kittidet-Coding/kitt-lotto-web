import { prisma } from '../src/lib/db'

async function main() {
  const backup = ["176","984","186","362","962","713","603","478","343","443","507","318","108","931","609","019","605","903","043","603"];

  console.log('Seeding historical draws...')

  for (const num of backup) {
    await prisma.draw.create({
      data: {
        winningNumber: num,
      },
    })
  }

  console.log('Seeding complete.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
