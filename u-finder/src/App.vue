<script setup lang="ts">
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style scoped>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

nav {
  margin-bottom: 2rem;
  padding: 1rem;
  border-bottom: 1px solid #ccc;
}

nav a {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  color: #646cff;
  text-decoration: none;
  font-weight: 500;
  border-radius: 4px;
  transition: background-color 0.3s;
}

nav a:hover {
  background-color: rgba(100, 108, 255, 0.1);
}

nav a.router-link-active {
  color: #42b883;
  background-color: rgba(66, 184, 131, 0.1);
}
</style>
