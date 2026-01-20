const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const { PrismaClient } = require("@prisma/client")

dotenv.config()

const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (req, res) => {
  res.json({ ok: true })
})

app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: "asc" } })
    res.json(products)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to load products" })
  }
})

app.get("/api/reservations", async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({ orderBy: { id: "desc" } })
    res.json(reservations)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to load reservations" })
  }
})

app.post("/api/reservations", async (req, res) => {
  try {
    const { name, email, dateTime, notes } = req.body

    if (!name || !email || !dateTime) {
      return res.status(400).json({ error: "name, email, and dateTime are required" })
    }

    const parsed = new Date(dateTime)
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({ error: "dateTime must be a valid datetime string" })
    }

    const created = await prisma.reservation.create({
      data: {
        name,
        email,
        dateTime: parsed,
        notes: notes || "",
        status: "new"
      }
    })

    res.status(201).json(created)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to create reservation" })
  }
})

const PORT = 3000
const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})

async function shutdown() {
  try {
    await prisma.$disconnect()
  } finally {
    server.close(() => process.exit(0))
  }
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)