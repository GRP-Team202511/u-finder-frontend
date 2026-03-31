<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { toast } from "vue-sonner"
import { ThumbsUp, ThumbsDown, Copy, Check } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { submitMessageFeedback } from "@/api/chatApi"

const props = defineProps<{
  messageId: string
  initialFeedback?: "like" | "dislike" | null
  copyContent?: string
}>()

const { t } = useI18n()

// Current feedback state, initialised from prop
const rating = ref<"like" | "dislike" | null>(props.initialFeedback ?? null)

// When the underlying message changes (component reused with a different Dify message due
// to identical synthetic Vue key after conversation switch), reset ALL local state.
// Watching messageId catches the case where both old and new initialFeedback are null
// but the local rating was changed by a user click.
watch(
  () => props.messageId,
  () => {
    rating.value = props.initialFeedback ?? null
    isSubmitting.value = false
    copied.value = false
    if (copyResetTimer) {
      clearTimeout(copyResetTimer)
      copyResetTimer = null
    }
  }
)

// Also sync when only the feedback prop changes (e.g. same message, prop updated externally)
watch(
  () => props.initialFeedback,
  (newVal) => {
    rating.value = newVal ?? null
  }
)
// Whether a feedback API request is in-flight
const isSubmitting = ref(false)
// Whether the copy action has just succeeded (shows Check icon briefly)
const copied = ref(false)
let copyResetTimer: ReturnType<typeof setTimeout> | null = null

// Submit or revoke feedback; clicking the active button sends null (revoke)
const handleFeedback = async (value: "like" | "dislike") => {
  if (isSubmitting.value) return
  const next = rating.value === value ? null : value
  isSubmitting.value = true
  try {
    await submitMessageFeedback({ messageId: props.messageId, rating: next })
    rating.value = next
  } catch {
    toast.error(t("chat.feedback.submitError"))
  } finally {
    isSubmitting.value = false
  }
}

const handleCopy = async () => {
  if (!props.copyContent) return
  try {
    await navigator.clipboard.writeText(props.copyContent)
    copied.value = true
    if (copyResetTimer) clearTimeout(copyResetTimer)
    copyResetTimer = setTimeout(() => {
      copied.value = false
      copyResetTimer = null
    }, 2000)
  } catch {
    toast.error(t("chat.feedback.copyError"))
  }
}
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <div class="flex items-center gap-0.5">
      <!-- Copy button -->
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7 text-muted-foreground hover:text-foreground"
            :disabled="!copyContent"
            :aria-label="t('chat.feedback.copy')"
            @click="handleCopy"
          >
            <Check v-if="copied" class="size-3.5 text-green-500" />
            <Copy v-else class="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {{ copied ? t("chat.feedback.copied") : t("chat.feedback.copy") }}
        </TooltipContent>
      </Tooltip>

      <!-- Like button -->
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7 text-muted-foreground hover:text-foreground"
            :disabled="isSubmitting"
            :aria-label="t('chat.feedback.like')"
            :aria-pressed="rating === 'like'"
            @click="handleFeedback('like')"
          >
            <ThumbsUp
              class="size-3.5 transition-colors"
              :class="rating === 'like' ? 'fill-foreground text-foreground' : ''"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {{ t("chat.feedback.like") }}
        </TooltipContent>
      </Tooltip>

      <!-- Dislike button -->
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7 text-muted-foreground hover:text-foreground"
            :disabled="isSubmitting"
            :aria-label="t('chat.feedback.dislike')"
            :aria-pressed="rating === 'dislike'"
            @click="handleFeedback('dislike')"
          >
            <ThumbsDown
              class="size-3.5 transition-colors"
              :class="rating === 'dislike' ? 'fill-foreground text-foreground' : ''"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {{ t("chat.feedback.dislike") }}
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
</template>
