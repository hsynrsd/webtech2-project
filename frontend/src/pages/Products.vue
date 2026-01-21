<script setup>
import { onMounted, ref } from "vue"
import { API_BASE_URL } from "../api"
import { addToCart } from "../cart"

const products = ref([])
const loading = ref(true)
const error = ref("")

async function loadProducts() {
  loading.value = true
  error.value = ""
  try {
    const res = await fetch(`${API_BASE_URL}/products`)
    if (!res.ok) throw new Error("Failed to load products")
    products.value = await res.json()
  } catch (e) {
    error.value = e.message || "Unknown error"
  } finally {
    loading.value = false
  }
}

onMounted(() => loadProducts())
</script>

<template>
  <div>
    <h2>Products</h2>

    <p v-if="loading">Loading products...</p>
    <p v-else-if="error" style="color: red;">{{ error }}</p>

    <div v-else style="display: grid; gap: 12px; max-width: 700px;">
      <div
        v-for="p in products"
        :key="p.id"
        style="border: 1px solid #ddd; padding: 12px; border-radius: 8px; display:flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;"
      >
        <div>
          <div style="font-weight: bold;">{{ p.name }}</div>
          <div>€ {{ p.price }}</div>
        </div>

        <button @click="addToCart(p, 1)" style="padding: 8px 10px;">Add to cart</button>
      </div>
    </div>

    <button style="margin-top: 16px;" @click="loadProducts">Reload products</button>
  </div>
</template>