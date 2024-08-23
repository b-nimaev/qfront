<template>
    <div>
        <h5>Категория: {{ categoryName }}</h5>
        <hr>

        <h4>Выберите подкатегорию</h4>
        <!-- Таблица с существующими субкатегориями -->
        <table class="table table-striped mt-3">
            <thead>
                <tr>
                    <th>Название субкатегории</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="subcategory in subcategories" :key="subcategory._id">
                    <td>
                        <NuxtLink :to="'/user/subcategories/' + subcategory._id">{{ subcategory.name }}
                        </NuxtLink>
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
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();
const categoryName = ref('');
const subcategoryName = ref('');
const subcategories = ref<any[]>([]);
const errorMessage = ref<string | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;

const fetchSubcategories = async (page = 1) => {
    try {
        const token = authStore.token;
        const categoryId = route.params._id;
        console.log(`Подтягивание категории ${categoryId}`)

        const response = await $fetch<{ subcategories: any[], categoryName: string | null, totalPages: number, currentPage: number }>(`http://65.21.153.43:5000/api/subcategories/${categoryId}/subcategories`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                page,
                limit,
            },
        });

        subcategories.value = response.subcategories;
        currentPage.value = response.currentPage;
        totalPages.value = response.totalPages;
        categoryName.value = response.categoryName || ''; // Предполагаем, что имя категории возвращается с субкатегориями
        console.log(`Подкатегории категории ${categoryName.value} подтянуты`)
        console.log(subcategories.value)
    } catch (error) {
        console.error('Ошибка при получении списка субкатегорий:', error);
    }
}

const changePage = (page: number) => {
    if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        fetchSubcategories(page);
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
    await fetchSubcategories();
});
</script>
