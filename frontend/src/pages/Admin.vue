<script setup>
import { onMounted, ref } from "vue"
import { API_BASE_URL } from "../api"

const email = ref("admin@example.com")
const password = ref("admin123")
const token = ref(localStorage.getItem("adminToken") || "")

const loginError = ref("")
const loadingLogin = ref(false)

const products = ref([])
const reservations = ref([])
const orders = ref([])

const productName = ref("")
const productPrice = ref("")
const productStock = ref("")

async function adminFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      Authorization: `Bearer ${token.value}`
    }
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Request failed")
  return data
}

async function login() {
  loginError.value = ""
  loadingLogin.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Login failed")

    token.value = data.token
    localStorage.setItem("adminToken", token.value)

    await loadAll()
  } catch (e) {
    loginError.value = e.message || "Login failed"
  } finally {
    loadingLogin.value = false
  }
}

function logout() {
  token.value = ""
  localStorage.removeItem("adminToken")
  products.value = []
  reservations.value = []
  orders.value = []
}

async function loadAll() {
  products.value = await adminFetch("/admin/products")
  reservations.value = await adminFetch("/admin/reservations")
  orders.value = await adminFetch("/admin/orders")
}

async function createProduct() {
  const name = productName.value.trim()
  const price = Number(productPrice.value)
  const stock = Number(productStock.value || 0)

  if (!name || Number.isNaN(price)) return

  const created = await adminFetch("/admin/products", {
    method: "POST",
    body: JSON.stringify({ name, price, stock })
  })

  products.value = [created, ...products.value]
  productName.value = ""
  productPrice.value = ""
  productStock.value = ""
}

async function deleteProduct(id) {
  await adminFetch(`/admin/products/${id}`, { method: "DELETE" })
  products.value = products.value.filter(p => p.id !== id)
}

async function updateReservationStatus(id, status) {
  const updated = await adminFetch(`/admin/reservations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  })
  reservations.value = reservations.value.map(r => (r.id === id ? updated : r))
}

onMounted(async () => {
  if (token.value) {
    try {
      await loadAll()
    } catch (e) {
      logout()
    }
  }
})
</script>

<template>
  <div style="max-width: 980px;">
    <h2>Admin</h2>
    <p>Default login: <strong>admin@example.com / admin123</strong></p>

    <div v-if="!token" style="border: 1px solid #ddd; padding: 12px; border-radius: 8px; max-width: 420px;">
      <h3>Login</h3>
      <p v-if="loginError" style="color: red;">{{ loginError }}</p>

      <form @submit.prevent="login" style="display: grid; gap: 10px;">
        <label>
          Email
          <input v-model="email" type="email" style="width: 100%; padding: 8px;" />
        </label>

        <label>
          Password
          <input v-model="password" type="password" style="width: 100%; padding: 8px;" />
        </label>

        <button type="submit" :disabled="loadingLogin" style="padding: 10px;">
          <span v-if="loadingLogin">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>
    </div>

    <div v-else>
      <div style="display: flex; gap: 10px; align-items: center; justify-content: space-between; margin: 12px 0;">
        <div>Logged in as <strong>{{ email }}</strong></div>
        <div style="display:flex; gap:8px;">
          <button @click="loadAll" style="padding: 8px 10px;">Reload</button>
          <button @click="logout" style="padding: 8px 10px;">Logout</button>
        </div>
      </div>

      <h3>Products</h3>

      <div style="border: 1px solid #ddd; padding: 12px; border-radius: 8px; max-width: 520px; margin-bottom: 12px;">
        <h4>Create product</h4>
        <div style="display: grid; gap: 10px;">
          <input v-model="productName" placeholder="Name" style="padding: 8px;" />
          <input v-model="productPrice" placeholder="Price" style="padding: 8px;" />
          <input v-model="productStock" placeholder="Stock (optional)" style="padding: 8px;" />
          <button @click="createProduct" style="padding: 10px;">Create</button>
        </div>
      </div>

      <div style="display: grid; gap: 8px;">
        <div v-for="p in products" :key="p.id" style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; display:flex; justify-content: space-between; gap: 12px;">
          <div>
            <div style="font-weight: bold;">{{ p.name }}</div>
            <div>€ {{ p.price }} - Stock: {{ p.stock }}</div>
          </div>
          <button @click="deleteProduct(p.id)" style="padding: 8px 10px;">Delete</button>
        </div>
      </div>

      <hr style="margin: 18px 0;">

      <h3>Reservations</h3>
      <div style="display: grid; gap: 8px;">
        <div v-for="r in reservations" :key="r.id" style="border: 1px solid #ddd; padding: 10px; border-radius: 8px;">
          <div style="display:flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div>
              <div style="font-weight: bold;">{{ r.name }} ({{ r.email }})</div>
              <div>{{ new Date(r.dateTime).toLocaleString() }}</div>
              <div v-if="r.notes">Notes: {{ r.notes }}</div>
            </div>

            <div style="display:flex; align-items:center; gap:8px;">
              <label>
                Status:
                <select :value="r.status" @change="updateReservationStatus(r.id, $event.target.value)">
                  <option value="new">new</option>
                  <option value="confirmed">confirmed</option>
                  <option value="done">done</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      <hr style="margin: 18px 0;">

      <h3>Orders</h3>
      <div style="display:grid; gap: 10px;">
        <div v-for="o in orders" :key="o.id" style="border: 1px solid #ddd; padding: 10px; border-radius: 8px;">
          <div style="display:flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div>
              <div style="font-weight: bold;">Order #{{ o.id }} - € {{ Number(o.total).toFixed(2) }}</div>
              <div>{{ o.name }} ({{ o.email }}) - Status: {{ o.status }}</div>
              <div>{{ new Date(o.createdAt).toLocaleString() }}</div>
            </div>
          </div>

          <div style="margin-top: 8px;">
            <div style="font-weight: bold;">Items</div>
            <ul style="margin: 6px 0 0;">
              <li v-for="it in o.items" :key="it.id">
                {{ it.qty }} x {{ it.product.name }} - € {{ Number(it.unitPrice).toFixed(2) }} (line € {{ Number(it.lineTotal).toFixed(2) }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>