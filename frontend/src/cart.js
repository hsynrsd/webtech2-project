import { reactive, computed, watch } from "vue"

const KEY = "cart_v1"

function loadInitial() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export const cart = reactive({
  items: loadInitial()
})

watch(
  () => cart.items,
  (val) => {
    localStorage.setItem(KEY, JSON.stringify(val))
  },
  { deep: true }
)

export function addToCart(product, qty = 1) {
  const id = Number(product.id)
  const q = Number(qty) || 1
  const existing = cart.items.find(i => i.productId === id)
  if (existing) {
    existing.qty += q
  } else {
    cart.items.push({
      productId: id,
      name: product.name,
      price: Number(product.price),
      qty: q
    })
  }
}

export function removeFromCart(productId) {
  const id = Number(productId)
  const idx = cart.items.findIndex(i => i.productId === id)
  if (idx >= 0) cart.items.splice(idx, 1)
}

export function setQty(productId, qty) {
  const id = Number(productId)
  const q = Number(qty)
  const item = cart.items.find(i => i.productId === id)
  if (!item) return
  if (!Number.isFinite(q) || q <= 0) {
    removeFromCart(id)
  } else {
    item.qty = q
  }
}

export function clearCart() {
  cart.items.splice(0, cart.items.length)
}

export const cartCount = computed(() =>
  cart.items.reduce((sum, i) => sum + i.qty, 0)
)

export const cartTotal = computed(() =>
  cart.items.reduce((sum, i) => sum + i.price * i.qty, 0)
)