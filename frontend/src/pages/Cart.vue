<script setup>
import { computed, ref } from "vue"
import { API_BASE_URL } from "../api"
import { cart, cartTotal, clearCart, setQty, removeFromCart } from "../cart"

const name = ref("")
const email = ref("")
const loading = ref(false)
const error = ref("")
const success = ref("")

const items = computed(() => cart.items)

async function checkout() {
  error.value = ""
  success.value = ""

  if (!name.value.trim() || !email.value.trim()) {
    error.value = "Please enter name and email."
    return
  }
  if (items.value.length === 0) {
    error.value = "Your cart is empty."
    return
  }

  loading.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value.trim(),
        email: email.value.trim(),
        items: items.value.map(i => ({ productId: i.productId, qty: i.qty }))
      })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Checkout failed")

    success.value = `Order created! Order ID: ${data.id}`
    clearCart()
    name.value = ""
    email.value = ""
  } catch (e) {
    error.value = e.message || "Checkout failed"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="max-width: 820px;">
    <h2>Cart</h2>

    <p v-if="error" style="color: red;">{{ error }}</p>
    <p v-if="success" style="color: green;">{{ success }}</p>

    <div v-if="items.length === 0">
      <p>Your cart is empty.</p>
    </div>

    <div v-else style="display: grid; gap: 10px;">
      <div v-for="i in items" :key="i.productId" style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; display:flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
        <div>
          <div style="font-weight: bold;">{{ i.name }}</div>
          <div>€ {{ i.price }}</div>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <label>
            Qty:
            <input
              type="number"
              min="0"
              :value="i.qty"
              @input="setQty(i.productId, $event.target.value)"
              style="width: 80px; padding: 6px;"
            />
          </label>
          <button @click="removeFromCart(i.productId)" style="padding: 8px 10px;">Remove</button>
        </div>
      </div>

      <div style="margin-top: 10px; font-weight: bold;">
        Total: € {{ cartTotal.toFixed(2) }}
      </div>

      <hr />

      <h3>Checkout</h3>
      <form @submit.prevent="checkout" style="display:grid; gap:10px; max-width: 420px;">
        <label>
          Name
          <input v-model="name" type="text" style="width: 100%; padding: 8px;" />
        </label>

        <label>
          Email
          <input v-model="email" type="email" style="width: 100%; padding: 8px;" />
        </label>

        <button type="submit" :disabled="loading" style="padding: 10px;">
          <span v-if="loading">Submitting...</span>
          <span v-else>Place order</span>
        </button>
      </form>
    </div>
  </div>
</template>