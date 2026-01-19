<template>
  <div style="font-family: Arial; padding: 24px;">
    <h1>Reservation + E-commerce</h1>

    <nav style="display: flex; gap: 12px; margin-bottom: 16px;">
      <router-link to="/">Home</router-link>
      <router-link to="/products">Products</router-link>
      <router-link to="/reservations">Reservations</router-link>
      <router-link to="/admin">Admin</router-link>
    </nav>

    <router-view />
  </div>
</template>