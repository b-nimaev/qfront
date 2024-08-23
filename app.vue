<template>
  <div id="app">
    <header class="mb-2">
      <NuxtLink to="/">Название приложения</NuxtLink>&nbsp;&nbsp;&nbsp;<NuxtLink to="/admin">Вход для админов</NuxtLink>
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<style lang="scss">
body {
  background-color: #ccc;
}
#app {
  padding: 1rem;
  margin: 1rem;
  border-radius: 5px;
  background-color: #fff;
}
</style>
