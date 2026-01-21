import { createRouter, createWebHistory } from "vue-router"
import Home from "./pages/Home.vue"
import Products from "./pages/Products.vue"
import Reservations from "./pages/Reservations.vue"
import Cart from "./pages/Cart.vue"
import Admin from "./pages/Admin.vue"

const routes = [
  { path: "/", component: Home },
  { path: "/products", component: Products },
  { path: "/reservations", component: Reservations },
  { path: "/cart", component: Cart },
  { path: "/admin", component: Admin }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})