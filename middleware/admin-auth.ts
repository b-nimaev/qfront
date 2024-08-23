import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAuthStore } from "@/stores/auth";
import { useCookie } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const tokenCookie = useCookie("auth_token"); // Получаем токен из cookie
  const token = tokenCookie.value;

  // Если токен существует, проверяем авторизацию
  if (token) {
    await authStore.checkAuth();

    // Если пользователь уже авторизован и его роль администратор, перенаправляем на /admin/dashboard
    if (!authStore.isLoggedIn || authStore.user?.role !== "admin") {
      return navigateTo("/");
    } else {
      return navigateTo("/admin/dashboard")
    }
  }

  // Если токена нет или пользователь не администратор, ничего не делаем, страница /admin загружается
});
