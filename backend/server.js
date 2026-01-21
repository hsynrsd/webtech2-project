const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const { PrismaClient } = require("@prisma/client")

dotenv.config()

const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || ""
  const [type, token] = header.split(" ")

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing Authorization Bearer token" })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

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

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" })
  }

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const token = jwt.sign(
    { email, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  )

  res.json({ token })
})

app.get("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: "asc" } })
    res.json(products)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to load admin products" })
  }
})

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const { name, price, stock } = req.body
    if (!name || price === undefined) {
      return res.status(400).json({ error: "name and price are required" })
    }

    const created = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: Number.isFinite(Number(stock)) ? Number(stock) : 0
      }
    })

    res.status(201).json(created)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to create product" })
  }
})

app.post("/api/orders", async (req, res) => {
  try {
    const { name, email, items } = req.body

    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items must be a non-empty array" })
    }

    const cleaned = items
      .map(i => ({ productId: Number(i.productId), qty: Number(i.qty) }))
      .filter(i => Number.isFinite(i.productId) && Number.isFinite(i.qty) && i.qty > 0)

    if (cleaned.length === 0) {
      return res.status(400).json({ error: "items must contain valid productId and qty" })
    }

    const productIds = [...new Set(cleaned.map(i => i.productId))]
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({ error: "One or more products no longer exist" })
    }

    const byId = new Map(dbProducts.map(p => [p.id, p]))

    const lineItems = cleaned.map(i => {
      const p = byId.get(i.productId)
      const unitPrice = p.price
      const lineTotal = unitPrice * i.qty
      return {
        productId: p.id,
        qty: i.qty,
        unitPrice,
        lineTotal
      }
    })

    const total = lineItems.reduce((sum, li) => sum + li.lineTotal, 0)

    const created = await prisma.order.create({
      data: {
        name,
        email,
        total,
        status: "new",
        items: { create: lineItems }
      },
      include: {
        items: { include: { product: true } }
      }
    })

    res.status(201).json(created)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to create order" })
  }
})

app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { id: "desc" },
      include: {
        items: { include: { product: true } }
      }
    })
    res.json(orders)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to load admin orders" })
  }
})

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.product.delete({ where: { id } })
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to delete product" })
  }
})

app.get("/api/admin/reservations", requireAdmin, async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({ orderBy: { id: "desc" } })
    res.json(reservations)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to load admin reservations" })
  }
})

app.patch("/api/admin/reservations/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: "status is required" })
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status }
    })

    res.json(updated)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to update reservation" })
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