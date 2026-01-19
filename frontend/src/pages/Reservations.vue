<script setup>
import { ref } from "vue"
import { API_BASE_URL } from "../api"

const name = ref("")
const email = ref("")
const dateTime = ref("")
const notes = ref("")

const loading = ref(false)
const error = ref("")
const successMessage = ref("")

async function submitReservation() {
  error.value = ""
  successMessage.value = ""

  if (!name.value || !email.value || !dateTime.value) {
    error.value = "Please fill in name, email, and date/time."
    return
  }

  loading.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        dateTime: dateTime.value,
        notes: notes.value
      })
    })

    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || "Reservation failed"
      return
    }

    successMessage.value = `Reservation created (ID ${data.id})`

    name.value = ""
    email.value = ""
    dateTime.value = ""
    notes.value = ""
  } catch (e) {
    error.value = e.message || "Unknown error"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="max-width: 520px;">
    <h2>Reservations</h2>

    <p v-if="error" style="color: red;">{{ error }}</p>
    <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>

    <form @submit.prevent="submitReservation" style="display: grid; gap: 10px;">
      <label>
        Name *
        <input v-model="name" type="text" style="width: 100%; padding: 8px;" />
      </label>

      <label>
        Email *
        <input v-model="email" type="email" style="width: 100%; padding: 8px;" />
      </label>

      <label>
        Date and Time *
        <input v-model="dateTime" type="datetime-local" style="width: 100%; padding: 8px;" />
      </label>

      <label>
        Notes
        <textarea v-model="notes" rows="3" style="width: 100%; padding: 8px;"></textarea>
      </label>

      <button type="submit" :disabled="loading" style="padding: 10px;">
        <span v-if="loading">Submitting...</span>
        <span v-else>Create reservation</span>
      </button>
    </form>
  </div>
</template>