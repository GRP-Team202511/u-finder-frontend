<script setup lang="ts">
import { computed } from "vue"
import { renderMarkdown } from "@/lib/markdown"
import UniversityCard from "./UniversityCard.vue"

const props = defineProps<{
  content?: string
  universities?: any[]
}>()

const rendered = computed(() =>
  props.content ? renderMarkdown(props.content) : ""
)
</script>

<template>
  <div class="space-y-4">
    <!-- Normal markdown content -->
    <div
      v-if="content"
      class="prose prose-sm max-w-none dark:prose-invert"
      v-html="rendered"
    />

    <!-- University cards -->
    <div v-if="universities?.length" class="grid gap-4">
      <UniversityCard
        v-for="uni in universities"
        :key="uni.id"
        :university="uni"
      />
    </div>
  </div>
</template>