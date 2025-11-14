<script setup lang="ts">
</script>

<template>
  <div class="about">
    <h1>About Page</h1>
    <p>This is the about page of your Vue application.</p>
    <router-link to="/">Go to Home</router-link>
  </div>
</template>

<style scoped>
.about {
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #42b883;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

a {
  color: #646cff;
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  color: #535bf2;
}
</style>
