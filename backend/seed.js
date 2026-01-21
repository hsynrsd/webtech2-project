const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  await prisma.product.createMany({
    data: [
      { name: "Coffee Beans 1kg", price: 18.9, stock: 10 },
      { name: "Ceramic Mug", price: 12.5, stock: 25 },
      { name: "Gift Box", price: 29.0, stock: 5 }
    ],
    skipDuplicates: true
  })
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