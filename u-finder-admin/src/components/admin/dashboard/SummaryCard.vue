<template>
  <section class="box-border flex min-h-[120px] flex-col justify-center rounded-3xl border border-[#dddddd] bg-white px-5 py-4">
    <div class="mb-1.5 text-sm font-semibold leading-[1.25] text-[#6b6b6b]">{{ title }}</div>
    <div class="mb-1.5 text-[34px] font-extrabold leading-none tracking-[-0.02em] text-[#111111]">{{ value }}</div>
    <div v-if="subtitle" class="text-xs leading-[1.3] text-[#6b6b6b]">{{ subtitle }}</div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  subtitle?: string
}>()
</script>