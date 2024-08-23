<template>
    <div>
        <h6>Категория: <NuxtLink :to="'/admin/dashboard/categories/' + categoryName._id">{{ categoryName.name }}</NuxtLink> - {{ subcategoryName }}</h6>

        <!-- Форма для добавления нового FAQ -->
         <h5>Добавление FAQ</h5>
        <form @submit.prevent="createFAQ">
            <div class="mb-3">
                <label for="question" class="form-label">Вопрос</label>
                <input v-model="question" type="text" class="form-control" id="question" required />
            </div>
            <div class="mb-3">
                <label for="answer" class="form-label">Ответ</label>
                <textarea v-model="answer" class="form-control" id="answer" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Добавить FAQ</button>
        </form>

        <div v-if="errorMessage" class="alert alert-danger mt-3">
            {{ errorMessage }}
        </div>

        <hr />

        <!-- Таблица с существующими FAQ -->
        <div v-if="faqs.length">
            <h5>Существующие FAQ</h5>
            <table class="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Вопрос</th>
                        <th>Ответ</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="faq in faqs" :key="faq._id">
                        <td>{{ faq.question }}</td>
                        <td>{{ faq.answer }}</td>
                        <td>
                            <button class="btn btn-danger btn-sm" @click="deleteFAQ(faq._id)">Удалить</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else>
            <p>FAQ отсутствуют.</p>
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
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();
const subcategoryName = ref('');
const categoryName = ref<{ _id: string; name: string; }>({
    _id: '',
    name: ''
});
const question = ref('');
const answer = ref('');
const faqs = ref<any[]>([]);
const errorMessage = ref<string | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;

const fetchFAQs = async (page = 1) => {
    try {
        const token = authStore.token;
        const subcategoryId = route.params._id;

        const response = await $fetch<{ faqs: any[], totalPages: number, currentPage: number, subcategoryData: { name: string, category: string }, categoryData: { _id: string; name: string; } }>(
            `http://localhost:5000/api/faqs/${subcategoryId}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    page,
                    limit,
                },
            }
        );

        faqs.value = response.faqs;
        currentPage.value = response.currentPage;
        totalPages.value = response.totalPages;
        console.log(response)
        subcategoryName.value = response.subcategoryData.name;
        categoryName.value = response.categoryData;
    } catch (error) {
        console.error('Ошибка при получении списка FAQ:', error);
    }
};

const createFAQ = async () => {
    errorMessage.value = null;

    try {
        const token = authStore.token;
        const subcategoryId = route.params._id;

        await $fetch(`http://localhost:5000/api/faqs`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: {
                question: question.value,
                answer: answer.value,
                subcategory: subcategoryId,
            },
        });

        question.value = '';
        answer.value = '';
        fetchFAQs(); // Обновляем список FAQ после добавления нового
    } catch (error: any) {
        if (error.response?.status === 400) {
            errorMessage.value = 'Вопрос и ответ обязательны.';
        } else {
            errorMessage.value = 'Не удалось создать FAQ. Попробуйте позже.';
        }

        console.error('Ошибка при создании FAQ:', error);
    }
};

const deleteFAQ = async (faqId: string) => {
    try {
        const token = authStore.token;

        await $fetch(`http://localhost:5000/api/faqs/${faqId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        fetchFAQs(); // Обновляем список FAQ после удаления
    } catch (error) {
        console.error('Ошибка при удалении FAQ:', error);
        errorMessage.value = 'Не удалось удалить FAQ. Попробуйте позже.';
    }
};

const changePage = (page: number) => {
    if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        fetchFAQs(page);
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
    console.log(authStore.token)
    await authStore.checkAuth()
    fetchFAQs();
});
</script>
