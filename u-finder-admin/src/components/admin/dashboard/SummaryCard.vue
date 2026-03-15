<template>
  <section class="stat-card">
    <div class="stat-card__label">{{ title }}</div>
    <div class="stat-card__value">{{ value }}</div>
    <div v-if="subtitle" class="stat-card__sub">{{ subtitle }}</div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  subtitle?: string
}>()
</script>

<style scoped>
.stat-card {
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 24px;
  padding: 16px 20px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
}

.stat-card__label {
  font-size: 14px;
  line-height: 1.25;
  color: #6b6b6b;
  font-weight: 600;
  margin-bottom: 6px;
}

.stat-card__value {
  font-size: 34px;
  line-height: 1;
  font-weight: 800;
  color: #111111;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.stat-card__sub {
  font-size: 12px;
  line-height: 1.3;
  color: #6b6b6b;
}
</style>