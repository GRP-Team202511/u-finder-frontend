<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster position="bottom-right" :duration="3000" richColors />
  <div id="app">
    <router-view />
  </div>
</template>