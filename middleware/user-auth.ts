import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAuthStore } from "@/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const router = useRouter();

  // Проверяем авторизацию
  await authStore.checkAuth();

  if (!authStore.isLoggedIn || authStore.user?.role !== "user") {
    return navigateTo("/"); // Перенаправляем на страницу авторизации администратора
  }
});
