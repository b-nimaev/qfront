<template>
    <div>
        <h4>Создать категорию</h4>
        <hr>

        <!-- Форма для добавления новой категории -->
        <form @submit.prevent="createCategory">
            <div class="mb-3">
                <label for="categoryName" class="form-label">Название категории</label>
                <input v-model="categoryName" type="text" placeholder="напишите название категории" class="form-control" id="categoryName" required>
            </div>
            <button type="submit" class="btn btn-primary">Добавить категорию</button>
        </form>

        <div v-if="errorMessage" class="alert alert-danger mt-3">
            {{ errorMessage }}
        </div>

        <hr>

        <!-- Таблица с существующими категориями -->
        <table class="table table-striped mt-3">
            <thead>
                <tr>
                    <th>Название категории</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="category in categories" :key="category._id">
                    <td>
                        <!-- Добавляем ссылку на страницу субкатегорий -->
                        <NuxtLink :to="'/admin/dashboard/categories/' + category._id">
                            {{ category.name }}
                        </NuxtLink>

                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm" @click="deleteCategory(category._id)">
                            Удалить
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Пагинация -->
        <nav aria-label="Пагинация">
            <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(1)" aria-label="First">
                        Первая
                    </button>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(currentPage - 1)" aria-label="Previous">
                        &laquo;
                    </button>
                </li>

                <li v-for="page in paginationPages" :key="page" class="page-item"
                    :class="{ active: page === currentPage }">
                    <button v-if="page !== '...' && page !== 'first' && page !== 'last'" class="page-link"
                        @click="changePage(page)">
                        {{ page }}
                    </button>
                    <span v-else class="page-link">{{ page }}</span>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="changePage(currentPage + 1)" aria-label="Next">
                        &raquo;
                    </button>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="changePage(totalPages)" aria-label="Last">
                        Последняя
                    </button>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const categoryName = ref('');
const categories = ref<any[]>([]);
const errorMessage = ref<string | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;
const fetchCategories = async (page = 1) => {
    try {
        const token = authStore.token;
        const response = await $fetch<{ categories: any[], totalPages: number, currentPage: number }>('https://tt88.ru/backendapi/categories', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                page,
                limit,
            },
        });
        console.log(`Респонс: ${response}`)
        categories.value = response.categories;
        currentPage.value = response.currentPage;
        totalPages.value = response.totalPages;
    } catch (error) {
        console.error('Ошибка при получении списка категорий:', error);
    }
}

const createCategory = async () => {
    errorMessage.value = null;

    try {
        const token = authStore.token;
        await $fetch('https://tt88.ru/backendapi/categories', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: {
                name: categoryName.value,
            },
        });

        categoryName.value = '';
        fetchCategories(); // Обновляем список категорий после добавления новой
    } catch (error: any) {
        if (error.response?.status === 400) {
            errorMessage.value = 'Название категории обязательно.';
        } else {
            errorMessage.value = 'Не удалось создать категорию. Попробуйте позже.';
        }

        console.error('Ошибка при создании категории:', error);
    }
}

const deleteCategory = async (categoryId: string) => {
    try {
        const token = authStore.token;
        await $fetch(`https://tt88.ru/backendapi/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        fetchCategories(); // Обновляем список категорий после удаления
    } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        errorMessage.value = 'Не удалось удалить категорию. Попробуйте позже.';
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
