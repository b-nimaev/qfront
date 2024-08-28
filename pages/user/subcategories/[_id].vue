<template>
    <div>
        <h6>
            Категория:
            <NuxtLink :to="'/user/categories/' + categoryName._id">
                {{ categoryName.name }}
            </NuxtLink>
            - {{ subcategoryName.name }}
        </h6>

        <!-- Форма для поиска FAQ -->
        <h5>Поиск вопросов и ответов</h5>
        <div class="mb-3">
            <label for="searchQuery" class="form-label">Введите ваш вопрос</label>
            <input id="searchQuery" placeholder="Введите ваш вопрос..." class="form-control" type="text" v-model="query"
                @input="handleInput" />
        </div>

        <div v-if="errorMessage" class="alert alert-danger mt-3">
            {{ errorMessage }}
        </div>

        <hr />

        <!-- Список FAQ -->
        <div v-if="faqs.length">
            <ul class="list-group">
                <li v-for="faq in faqs" :key="faq._id" class="list-group-item">
                    <h5>{{ faq.question }}</h5>
                    <p>{{ faq.answer }}</p>
                </li>
            </ul>
        </div>
        <div v-else>
            <p>Нет результатов.</p>
        </div>

        <!-- Пагинация -->
        <nav aria-label="Пагинация">
            <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(1)">Первая</button>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(currentPage - 1)">&laquo;</button>
                </li>

                <li v-for="page in paginationPages" :key="page" class="page-item"
                    :class="{ active: page === currentPage }">
                    <button class="page-link" @click="changePage(page)">{{ page }}</button>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="changePage(currentPage + 1)">&raquo;</button>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="changePage(totalPages)">Последняя</button>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();

const subcategoryName = ref<{ _id: string; name: string; }>({ _id: '', name: '' });
const categoryName = ref<{ _id: string; name: string; }>({ _id: '', name: '' });
const query = ref('');
const faqs = ref<any[]>([]);
const errorMessage = ref<string | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;
const cat_id = route.params._id
// Обработчик ввода, который запускает поиск
const handleInput = async () => {
    currentPage.value = 1; // Обнуляем текущую страницу при новом запросе
    await searchFAQs(); // Выполняем поиск
};
// Поиск FAQ по введенному запросу в реальном времени
const fetchCategory = async (page = 1) => {
    try {
        const token = authStore.token;

        const response = await $fetch<any>(
            `https://tt88.ru/backendapi/subcategories/${cat_id}/subcategory`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );

        subcategoryName.value = response.subcategory
        categoryName.value = response.category;

    } catch (error) {
        console.error('Ошибка при получении информации о категории:', error);
        errorMessage.value = 'Ошибка при получении информации. Попробуйте позже.';
    }
};
// Поиск FAQ по введенному запросу в реальном времени
const searchFAQs = async (page = 1) => {
    if (query.value.trim() === '') {
        faqs.value = [];
        return;
    }

    try {
        const token = authStore.token;
        const subcategoryId = route.params._id;
        await authStore.checkAuth()
        const response = await $fetch<{ faqs: any[], totalPages: number, currentPage: number }>(
            `https://tt88.ru/backendapi/search`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    query: query.value,
                    subcategoryId,
                    page,
                    limit,
                },
            }
        );

        faqs.value = response.faqs;
        currentPage.value = response.currentPage;
        totalPages.value = response.totalPages;
    } catch (error) {
        console.error('Ошибка при поиске FAQ:', error);
        errorMessage.value = 'Не удалось выполнить поиск. Попробуйте позже.';
    }
};

// Пагинация
const changePage = (page: number) => {
    if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        searchFAQs(page);
    }
};

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
    await authStore.checkAuth();
    await fetchCategory()
});
</script>
