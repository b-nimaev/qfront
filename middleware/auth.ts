import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAuthStore } from "@/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const router = useRouter();

  // Проверяем авторизацию
  await authStore.checkAuth(true);

  if (authStore.isLoggedIn && authStore.user?.role == "admin") {
    return navigateTo("/admin"); // Перенаправляем на страницу авторизации администратора
  }
  if (authStore.isLoggedIn && authStore.user?.role == "user") {
    return navigateTo("/user"); // Перенаправляем на страницу авторизации администратора
  }
});
