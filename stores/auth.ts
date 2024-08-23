import { defineStore } from "pinia";
import { type Router } from "vue-router";
import { useCookie } from "nuxt/app";

interface User {
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  token: string | null;
  status: "idle" | "loading" | "success" | "error";
  errorMessage: string;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    isLoggedIn: false,
    token: null,
    status: "idle",
    errorMessage: "",
  }),

  actions: {
    async login(
      username: string,
      password: string | undefined,
    ) {
      this.status = "loading";
      this.errorMessage = "";
      try {
        const response = await $fetch<{ token: string; user: User }>(
          "http://65.21.153.43:5000/api/auth/login",
          {
            method: "POST",
            body: { username, password },
          }
        );

        this.user = response.user;
        this.token = response.token;
        this.isLoggedIn = true;

        const tokenCookie = useCookie("auth_token"); // Инициализируем cookie
        tokenCookie.value = this.token; // Сохраняем токен в cookie

        this.status = "success";

        if (this.user?.role === "admin") {
          navigateTo("/admin");
        } else {
          navigateTo("/user");
        }
      } catch (error: any) {
        this.status = "error";
        if (error.response && error.response.status) {
          const status = error.response.status;
          if (status === 403) {
            this.errorMessage = "Error 403: Пользователь уже авторизован";
          } else if (status === 404) {
            this.errorMessage = "Error 404: Пользователь не найден";
          } else if (status === 401) {
            this.errorMessage = "Error 401: Пароль неверный";
          } else if (status === 400) {
            this.errorMessage = "Error 400: Нужен пароль";
          } else {
            this.errorMessage = "Login failed: " + error.message;
          }
        } else {
          this.errorMessage = "Unexpected error: " + error.message;
        }
      }
    },

    async logout() {
      this.status = "loading";
      try {
        // Выполняем запрос на сервер для логаута
        await $fetch("http://65.21.153.43:5000/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        this.user = null;
        this.token = null;
        this.isLoggedIn = false;
        this.status = "idle";
        this.errorMessage = "";

        const tokenCookie = useCookie("auth_token"); // Инициализируем cookie
        tokenCookie.value = null; // Удаляем токен из cookie

        navigateTo("/");
      } catch (error: any) {
        this.status = "error";
        this.errorMessage =
          "Logout failed: " + (error.message || "Unknown error");
      }
    },

    async checkAuth(without_logout?: boolean) {
      console.log("Проверка авторизации")
      const tokenCookie = useCookie("auth_token"); // Получаем токен из cookie
      console.log("Токен из кука: " + tokenCookie.value)
      const token = tokenCookie.value;
      if (token) {
        try {
          const response = await $fetch<{ user: User }>(
            "http://65.21.153.43:5000/api/auth/check-auth",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log(response)

          this.user = response.user;
          this.isLoggedIn = true;
          this.token = token;

          console.log(this.token)
        } catch (error) {
          this.logout();
        }
      } else if (without_logout) {
        // this.logout();
      } else {
        this.logout()
      }
    },
  },
});
