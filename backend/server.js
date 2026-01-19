const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const products = [
  { id: 1, name: "Coffee Beans 1kg", price: 18.9 },
  { id: 2, name: "Ceramic Mug", price: 12.5 },
  { id: 3, name: "Gift Box", price: 29.0 }
]

const reservations = [
  {
    id: 1,
    name: "Anna",
    email: "anna@example.com",
    dateTime: "2026-01-15T18:00",
    notes: "Table for 2",
    status: "new"
  }
]

app.get("/api/health", (req, res) => {
  res.json({ ok: true })
})

app.get("/api/products", (req, res) => {
  res.json(products)
})

app.get("/api/reservations", (req, res) => {
  res.json(reservations)
})

app.post("/api/reservations", (req, res) => {
  const { name, email, dateTime, notes } = req.body

  if (!name || !email || !dateTime) {
    return res.status(400).json({ error: "name, email, and dateTime are required" })
  }

  const newReservation = {
    id: reservations.length + 1,
    name,
    email,
    dateTime,
    notes: notes || "",
    status: "new"
  }

  reservations.push(newReservation)
  res.status(201).json(newReservation)
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})