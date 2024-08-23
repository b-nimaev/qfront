<template>
    <div>
        <h1>User Login</h1>
        <form @submit.prevent="login">
            <div>
                <label for="username">Username:</label>
                <input v-model="username" type="text" id="username" required />
            </div>
            <button type="submit" :disabled="authStore.status === 'loading'">Login</button>
        </form>
        <p v-if="authStore.status === 'error'" class="error">{{ authStore.errorMessage }}</p>
        <p v-if="authStore.status === 'success'" class="success">Login successful, redirecting...</p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const authStore = useAuthStore()

const login = async () => {
    await authStore.login(username.value, undefined)
}
</script>

<style scoped>
.error {
    color: red;
    margin-top: 1rem;
}

.success {
    color: green;
    margin-top: 1rem;
}
</style>
