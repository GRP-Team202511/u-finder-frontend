<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { renderMarkdown } from "@/lib/markdown"
import UniversityCard from "./UniversityCard.vue"
import type { ProgramCardData } from "@/types/chat"

const props = defineProps<{
  content?: string
  tailContent?: string
  universities?: ProgramCardData[]
  isLoading?: boolean
}>()

const searchingMarker = "<<__SEARCHING__>>"
const stripControlMarkers = (value: string) =>
  value.split(searchingMarker).join("")

const rendered = computed(() =>
  props.content ? renderMarkdown(stripControlMarkers(props.content)) : ""
)

const renderedTail = computed(() =>
  props.tailContent ? renderMarkdown(stripControlMarkers(props.tailContent)) : ""
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
    if (props.isLoading) {
      showDots.value = true
    }
    dotsTimer = null
  }, 600)
}

watch(
  () => [props.isLoading, props.content, props.tailContent, props.universities?.length] as const,
  (
    [isLoading, content, tailContent, universitiesLength],
    prev = [false, undefined, undefined, undefined] as const
  ) => {
    const [prevLoading, prevContent, prevTailContent, prevUniversitiesLength] = prev
    const isLoadingBool = Boolean(isLoading)
    const contentChanged = content !== prevContent
    const tailChanged = tailContent !== prevTailContent
    const cardsChanged = universitiesLength !== prevUniversitiesLength

    if (!isLoadingBool) {
      resetDots()
      return
    }

    if (!prevLoading && isLoadingBool) {
      resetDots()
    }

    if (contentChanged || tailChanged || cardsChanged) {
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

    <!-- University cards -->
    <div v-if="universities?.length" class="grid gap-4">
      <UniversityCard
        v-for="uni in universities"
        :key="uni.official_program_url || `${uni.university.name}-${uni.degree_program.name}`"
        :program="uni"
      />
    </div>

    <div
      v-if="tailContent"
      class="prose prose-base max-w-none dark:prose-invert"
      v-html="renderedTail"
    />

    <div v-if="showDots" class="flex items-center text-muted-foreground">
      <span class="typing-dots" aria-label="AI is typing">
        <span class="dot" />
        <span class="dot" />
        <span class="dot" />
      </span>
    </div>
  </div>
</template>