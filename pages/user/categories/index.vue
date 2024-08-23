<template>
    <div>
        <h1>Выберите категорию</h1>
        <ul>
            <li v-for="category in categories" :key="category._id">
                <NuxtLink :to="{ name: 'dashboard-categories-categoryId', params: { categoryId: category._id } }">
                    {{ category.name }}
                </NuxtLink>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '#imports';
const authStore = useAuthStore();
const categories = ref<any[]>([]);
const errorMessage = ref<string | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;
const fetchCategories = async (page = 1) => {
    try {
        const token = authStore.token;
        const response = await $fetch<{ categories: any[], totalPages: number, currentPage: number }>('http://localhost:5000/api/categories', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                page,
                limit,
            },
        });

        categories.value = response.categories;
        currentPage.value = response.currentPage;
        totalPages.value = response.totalPages;
    } catch (error) {
        console.error('Ошибка при получении списка категорий:', error);
    }
}
const changePage = (page: number) => {
    if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        fetchCategories(page);
    }
}

// Генерация списка страниц для пагинации
const paginationPages = computed(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages.value <= maxVisiblePages) {
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage.value > 2) {
            pages.push(1, '...');
        } else {
            pages.push(1);
        }

        const startPage = Math.max(2, currentPage.value - 1);
        const endPage = Math.min(totalPages.value - 1, currentPage.value + 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (currentPage.value < totalPages.value - 1) {
            pages.push('...', totalPages.value);
        } else {
            pages.push(totalPages.value);
        }
    }

    return pages;
});
onBeforeMount(async () => {
    await authStore.checkAuth()
    fetchCategories();
});
</script>
