<!-- src/views/LoginView.vue -->
<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const password = ref('')
const message = ref('')

const login = async () => {
  try {
    const res = await axios.post('http://localhost:3001/api/login', {
      email: email.value,
      password: password.value
    })
    localStorage.setItem('token', res.data.token)
    message.value = 'Login successful!'
  } catch (err) {
    message.value = 'Login failed.'
  }
}
</script>

