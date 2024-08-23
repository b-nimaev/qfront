<template>
    <div>
        <h1>Добро пожаловать</h1>
        <p class="mb-0">Войдите для использования сервиса</p>
        <div>
            <form class="mt-2" @submit.prevent="login">
                <div class="mb-3">
                    <label for="username" class="form-label">Имя пользователя:</label>
                    <div style="display: flex;">
                        <input v-model="username" type="text" id="username" class="form-control"
                            style="max-width: 300px;" placeholder="Введите имя пользователя" required />
                        <button type="submit" class="btn btn-primary" :disabled="authStore.status === 'loading'"
                            style="margin: auto 10px">Войти</button>
                    </div>
                </div>
            </form>
            <p v-if="authStore.status === 'error'" class="error">{{ authStore.errorMessage }}</p>
            <p v-if="authStore.status === 'success'" class="success">Login successful, redirecting...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth';
const username = ref('')
const errorMessage = ref('')
const password = ref('')
const successMessage = ref('')
const authStore = useAuthStore()
const router = useRouter()
definePageMeta({
    middleware: 'auth'
})
const login = async () => {
    try {
        errorMessage.value = ''
        successMessage.value = ''

        await authStore.login(username.value, password.value)

        successMessage.value = 'Login successful, redirecting...'
    } catch (error: any) {
        successMessage.value = ''
        errorMessage.value = authStore.errorMessage
    }
}
</script>

<style scoped>
/* Добавьте стили для главной страницы здесь */
</style>
