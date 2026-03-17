<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { renderMarkdown } from "@/lib/markdown"
import UniversityCard from "./UniversityCard.vue"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ProgramCardData } from "@/types/chat"

const props = defineProps<{
  content?: string
  tailContent?: string
  universities?: ProgramCardData[]
  isLoading?: boolean
  isUniversityCardLoading?: boolean
}>()

const { t } = useI18n()

const searchingMarker = "<<__SEARCHING__>>"
const stripControlMarkers = (value: string) =>
  value.split(searchingMarker).join("")

const rendered = computed(() =>
  props.content ? renderMarkdown(stripControlMarkers(props.content)) : ""
)

const renderedTail = computed(() =>
  props.tailContent ? renderMarkdown(stripControlMarkers(props.tailContent)) : ""
)

const showUniversityCardSkeleton = computed(
  () => Boolean(props.isLoading && props.isUniversityCardLoading)
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
    if (props.isLoading && !props.isUniversityCardLoading) {
      showDots.value = true
    }
    dotsTimer = null
  }, 600)
}

watch(
  () => [props.isLoading, props.isUniversityCardLoading, props.content, props.tailContent, props.universities?.length] as const,
  (
    [isLoading, isUniversityCardLoading, content, tailContent, universitiesLength],
    prev = [false, false, undefined, undefined, undefined] as const
  ) => {
    const [prevLoading, prevCardLoading, prevContent, prevTailContent, prevUniversitiesLength] = prev
    const isLoadingBool = Boolean(isLoading)
    const isCardLoading = Boolean(isUniversityCardLoading)
    const contentChanged = content !== prevContent
    const tailChanged = tailContent !== prevTailContent
    const cardsChanged = universitiesLength !== prevUniversitiesLength
    const cardLoadingChanged = isCardLoading !== Boolean(prevCardLoading)

    if (!isLoadingBool) {
      resetDots()
      return
    }

    if (!prevLoading && isLoadingBool) {
      resetDots()
    }

    if (contentChanged || tailChanged || cardsChanged || cardLoadingChanged) {
      resetDots()
    }

    if (isCardLoading) {
      return
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

    <!-- University cards and per-card loading skeleton -->
    <div v-if="universities?.length || showUniversityCardSkeleton" class="grid gap-4">
      <UniversityCard
        v-if="universities?.length"
        v-for="uni in universities"
        :key="uni.official_program_url || `${uni.university.name}-${uni.degree_program.name}`"
        :program="uni"
      />

      <div
        v-if="showUniversityCardSkeleton"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span class="sr-only">{{ t('chat.card.loadingAria') || 'University information loading' }}</span>

        <Card>
          <CardHeader>
            <div class="flex items-start justify-between gap-4">
              <div class="w-full space-y-2">
                <Skeleton class="h-7 w-2/3" />
                <Skeleton class="h-4 w-1/3" />
              </div>
              <Skeleton class="h-9 w-9 rounded-md" />
            </div>
          </CardHeader>

          <CardContent class="text-base">
            <div class="pb-8 space-y-2">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-5 w-4/5" />
            </div>

            <div class="space-y-4 text-sm">
              <div class="flex gap-2">
                <Skeleton class="h-8 w-24 rounded-md" />
                <Skeleton class="h-8 w-32 rounded-md" />
                <Skeleton class="h-8 w-28 rounded-md" />
              </div>

              <div class="mt-4 grid gap-2">
                <Skeleton class="h-4 w-40" />
                <div class="grid gap-2">
                  <div class="flex items-center justify-between gap-4">
                    <Skeleton class="h-4 w-20" />
                    <Skeleton class="h-4 w-28" />
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <Skeleton class="h-4 w-16" />
                    <Skeleton class="h-4 w-24" />
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <Skeleton class="h-4 w-14" />
                    <Skeleton class="h-4 w-32" />
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <Skeleton class="h-4 w-16" />
                    <Skeleton class="h-4 w-20" />
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <Skeleton class="h-4 w-20" />
                    <Skeleton class="h-4 w-28" />
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <Skeleton class="h-4 w-20" />
                    <Skeleton class="h-4 w-24" />
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <Skeleton class="h-4 w-16" />
                    <Skeleton class="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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