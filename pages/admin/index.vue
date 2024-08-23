<template>
    <div>
        <h1>Admin Login</h1>
        <form @submit.prevent="login" style="max-width: 300px;">
            <div class="mb-3">
                <label for="username" class="form-label">Логин:</label>
                <input v-model="username" type="text" class="form-control" id="username" required />
            </div>
            <div>
                <label for="password" class="form-label">Пароль:</label>
                <input v-model="password" type="password" class="form-control" id="password" required />
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 10px">Login</button>
        </form>
        <p v-if="authStore.errorMessage" class="error">{{ authStore.errorMessage }}</p>
        <p v-if="authStore.status === 'success'" class="success">{{ successMessage }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

definePageMeta({
    middleware: 'admin-auth'
})

const username = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const authStore = useAuthStore()
const router = useRouter()

const login = async () => {
    try {
        errorMessage.value = ''
        successMessage.value = ''

        await authStore.login(username.value, password.value)
    } catch (error: any) {
        successMessage.value = ''
        errorMessage.value = authStore.errorMessage
    }
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
