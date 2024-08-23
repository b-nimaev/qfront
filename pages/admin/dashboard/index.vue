<template>
  <div>
    <h4>Admin Dashboard</h4>
    <hr>
    <ul>
      <li><NuxtLink to="/admin/dashboard/categories">Категории</NuxtLink></li>
      <li><NuxtLink to="/admin/dashboard/users">Пользователи</NuxtLink></li>
    </ul>
    <button class="btn btn-danger" @click="handleLogout">Выйти</button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

definePageMeta({
  middleware: 'admin-dash',
});

const handleLogout = () => {
  authStore.logout()
}
</script>
