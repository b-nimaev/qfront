<template>
    <div>
        <h4>Admin Dashboard</h4>
        <h6>Пользователи</h6>
        <hr>
        <form @submit.prevent="create_user">
            <div class="mb-3">
                <label for="username" class="form-label">Имя пользователя</label>
                <input v-model="username" type="text" class="form-control" id="username" required>
            </div>
            <div class="mb-3">
                <label for="role" class="form-label">Роль</label>
                <select v-model="role" class="form-control" id="role" required>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="date" class="form-label">Дата окончания действия</label>
                <input v-model="date" type="date" class="form-control" id="date" required>
            </div>
            <div class="mb-3">
                <label for="time" class="form-label">Время окончания действия</label>
                <input v-model="time" type="time" step="1" class="form-control" id="time" required>
            </div>
            <button type="submit" class="btn btn-primary">Создать пользователя</button>
        </form>

        <!-- Вывод ошибки, если она есть -->
        <div v-if="errorMessage" class="alert alert-danger mt-3">
            {{ errorMessage }}
        </div>

        <hr>

        <!-- Поиск пользователей -->
        <div class="mb-3">
            <label for="search" class="form-label">Поиск пользователей</label>
            <input v-model="searchQuery" @input="fetchUsers" type="text" class="form-control" id="search"
                placeholder="Введите имя пользователя">
        </div>

        <!-- Таблица пользователей -->
        <table class="table table-striped mt-3">
            <thead>
                <tr>
                    <th>Имя пользователя</th>
                    <th>Роль</th>
                    <th>Дата окончания действия</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user._id">
                    <td>{{ user.username }}</td>
                    <td>{{ user.role }}</td>
                    <td>{{ user.expiresAt ? new Date(user.expiresAt).toLocaleString() : 'Не ограничено' }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Пагинация -->
        <nav aria-label="Пагинация">
            <ul class="pagination">
                <!-- Кнопка для перехода к первой странице -->
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(1)" aria-label="First">
                        Первая
                    </button>
                </li>

                <!-- Кнопка для перехода на предыдущую страницу -->
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(currentPage - 1)" aria-label="Previous">
                        &laquo;
                    </button>
                </li>

                <!-- Кнопки для отображения номеров страниц -->
                <li v-for="page in paginationPages" :key="page" class="page-item"
                    :class="{ active: page === currentPage }">
                    <button v-if="page !== '...' && page !== 'first' && page !== 'last'" class="page-link"
                        @click="changePage(page)">
                        {{ page }}
                    </button>
                    <span v-else class="page-link">{{ page }}</span>
                </li>

                <!-- Кнопка для перехода на следующую страницу -->
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="changePage(currentPage + 1)" aria-label="Next">
                        &raquo;
                    </button>
                </li>

                <!-- Кнопка для перехода к последней странице -->
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="changePage(totalPages)" aria-label="Last">
                        Последняя
                    </button>
                </li>
            </ul>
        </nav>

        <button class="btn btn-danger" @click="handleLogout">Выйти</button>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

definePageMeta({
    middleware: ['admin-dash'],
});

const username = ref('');
const role = ref('user');
const date = ref('');
const time = ref('');
const errorMessage = ref<string | null>(null);
const searchQuery = ref('');
const users = ref<any[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;

const handleLogout = () => {
    authStore.logout();
}

const create_user = async () => {
    errorMessage.value = null;

    try {
        const token = authStore.token;

        const expirationDateTime = new Date(`${date.value}T${time.value}`);
        const durationInSeconds = Math.floor((expirationDateTime.getTime() - Date.now()) / 1000);

        await $fetch('http://65.21.153.43:5000/api/users/register', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: {
                username: username.value,
                role: role.value,
                activeDuration: durationInSeconds > 0 ? durationInSeconds : undefined,
            },
        });

        username.value = '';
        role.value = 'user';
        date.value = '';
        time.value = '';
        fetchUsers();
    } catch (error: any) {
        if (error.response?.status === 409) {
            errorMessage.value = 'Пользователь с таким именем уже существует.';
        } else if (error.response?.status === 400) {
            errorMessage.value = 'Пожалуйста, заполните все обязательные поля.';
        } else {
            errorMessage.value = 'Не удалось создать пользователя. Попробуйте позже.';
        }

        console.error('Ошибка при создании пользователя:', error);
    }
}

const fetchUsers = async (page = 1) => {
    try {
        const token = authStore.token;
        const response = await $fetch<{ users: any[], totalPages: number, currentPage: number }>('http://65.21.153.43:5000/api/users/users', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                username: searchQuery.value,
                page,
                limit,
            },
        });

        users.value = response.users;
        currentPage.value = response.currentPage;
        totalPages.value = response.totalPages;
    } catch (error) {
        console.error('Ошибка при получении списка пользователей:', error);
    }
}

const changePage = (page: number) => {
    if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        fetchUsers(page);
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
    await fetchUsers();
});
</script>