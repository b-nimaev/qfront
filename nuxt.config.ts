// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  css: [
    // Подключаем стили из node_modules
    "bootstrap/dist/css/bootstrap.min.css",
  ],
  plugins: [
    // Подключаем Bootstrap JavaScript
    { src: "~/plugins/bootstrap.client.ts", mode: "client" },
  ],
});