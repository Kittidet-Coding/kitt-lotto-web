import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const history60 = [
    "770", "387", "077", "612", "514", "009", "866", "563", "629", "972",
    "706", "895", "252", "145", "898", "696", "978", "646", "356", "865",
    "852", "324", "246", "392", "352", "309", "388", "227", "687", "563",
    "894", "377", "700", "779", "209", "863", "843", "221", "044", "962",
    "665", "662", "606", "867", "041", "336", "503", "504", "593", "690",
    "116", "598", "481", "544", "626", "603", "395", "063", "979", "757"
  ];

  console.log('Clearing old data and seeding 60 historical draws...')

  // Delete all existing draws first
  await prisma.draw.deleteMany({});

  for (let i = 0; i < history60.length; i++) {
    await prisma.draw.create({
      data: {
        winningNumber: history60[i],
        // Set dates manually to maintain order (descending)
        drawDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000) 
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
