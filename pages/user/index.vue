<template>
    <div>
        <h1>User Dashboard</h1>
        <p>Добро пожаловать, {{ authStore.user ? authStore.user.username : null }}!</p>

        <button class="btn btn-danger" @click="handleLogout">Выйти</button>

        <hr />

        <!-- Список категорий -->
        <div v-if="categories.length">
            <h2>Выберите категорию</h2>
            <ul>
                <li v-for="category in categories" :key="category._id">
                    <NuxtLink :to="'/user/categories/' + category._id">
                        {{ category.name }}
                    </NuxtLink>
                </li>
            </ul>
        </div>
        <div v-else>
            <p>Категории отсутствуют.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
const authStore = useAuthStore();
const router = useRouter();

const categories = ref<{
    name: string;
    _id: string;
}[]>([]);

const fetchCategories = async () => {
    try {
        const response = await $fetch<{
            categories: {
                name: string;
                _id: string;
            }[],
            totalPages: number,
            currentPage: number
        }>('https://tt88.ru/backendapi/categories');
        categories.value = response.categories;
        console.log(response)
    } catch (error) {
        console.error('Ошибка при получении категорий:', error);
    }
};

const handleLogout = async () => {
    await authStore.logout();
};

onBeforeMount(async () => {
    await authStore.checkAuth()
    fetchCategories();
});
</script>
