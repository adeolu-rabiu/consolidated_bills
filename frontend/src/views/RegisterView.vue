<!-- src/views/RegisterView.vue -->
<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="register">
      <input v-model="username" placeholder="Username" />
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Register</button>
    </form>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const username = ref('')
const email = ref('')
const password = ref('')
const message = ref('')

const register = async () => {
  try {
    await axios.post('http://localhost:3001/api/register', {
      username: username.value,
      email: email.value,
      password: password.value
    })
    message.value = 'Registration successful!'
  } catch (err) {
    message.value = 'Registration failed.'
  }
}
</script>

