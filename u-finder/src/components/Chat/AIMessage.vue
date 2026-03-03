<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { renderMarkdown } from "@/lib/markdown"
import UniversityCard from "./UniversityCard.vue"
import type { ProgramCardData } from "@/types/chat"

const props = defineProps<{
  content?: string
  universities?: ProgramCardData[]
  isLoading?: boolean
}>()

const rendered = computed(() =>
  props.content ? renderMarkdown(props.content) : ""
)

const showDots = ref(false)
let dotsTimer: ReturnType<typeof setTimeout> | null = null

const resetDots = () => {
  showDots.value = false
  if (dotsTimer) {
    clearTimeout(dotsTimer)
    dotsTimer = null
  }
}

const scheduleDots = () => {
  if (dotsTimer) return
  dotsTimer = setTimeout(() => {
    const hasCards = Boolean(props.universities?.length)
    if (props.isLoading && !hasCards) {
      showDots.value = true
    }
    dotsTimer = null
  }, 600)
}

watch(
  () => [props.isLoading, props.content, props.universities?.length] as const,
  (
    [isLoading, content, universitiesLength],
    prev = [false, undefined, undefined] as const
  ) => {
    const [prevLoading, prevContent] = prev
    const isLoadingBool = Boolean(isLoading)
    const hasCards = Boolean(universitiesLength && universitiesLength > 0)
    const contentChanged = content !== prevContent

    if (!isLoadingBool || hasCards) {
      resetDots()
      return
    }

    if (!prevLoading && isLoadingBool) {
      resetDots()
    }

    if (contentChanged) {
      resetDots()
    }

    scheduleDots()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  resetDots()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Normal markdown content -->
    <div
      v-if="content"
      class="prose prose-base max-w-none dark:prose-invert"
      v-html="rendered"
    />

    <div v-if="showDots" class="flex items-center text-muted-foreground">
      <span class="typing-dots" aria-label="AI is typing">
        <span class="dot" />
        <span class="dot" />
        <span class="dot" />
      </span>
    </div>

    <!-- University cards -->
    <div v-if="universities?.length" class="grid gap-4">
      <UniversityCard
        v-for="uni in universities"
        :key="uni.official_program_url || `${uni.university.name}-${uni.degree_program.name}`"
        :program="uni"
      />
    </div>
  </div>
</template>