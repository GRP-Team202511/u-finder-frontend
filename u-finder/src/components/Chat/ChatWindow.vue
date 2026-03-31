<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ArrowDown } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/Chat/ChatMessage.vue";
import type { ChatMessageData } from "@/types/chat";

const props = defineProps<{
	messages: ChatMessageData[];
	loadingMessageId?: string | null;
	isSending?: boolean;
}>();

const bottomEl = ref<HTMLElement | null>(null);
const scrollportEl = ref<HTMLElement | null>(null);

// Whether the viewport is currently within the "at bottom" threshold
const isAtBottom = ref(true);
// Distance from the bottom (in px) within which we consider the user "at bottom"
const BOTTOM_THRESHOLD = 60;

const checkIsAtBottom = (): boolean => {
	const el = scrollportEl.value;
	if (!el) return true;
	return el.scrollTop + el.clientHeight >= el.scrollHeight - BOTTOM_THRESHOLD;
};

const scrollToBottom = () => {
	const anchor = bottomEl.value;
	if (!anchor) return;
	anchor.scrollIntoView({ block: "end" });
};

let rafId: number | null = null;
const scheduleScrollToBottom = () => {
	if (rafId !== null) return;
	rafId = requestAnimationFrame(() => {
		rafId = null;
		scrollToBottom();
	});
};

// Throttle scroll event checks with rAF to avoid high-frequency updates
let scrollRafId: number | null = null;
const handleScroll = () => {
	if (scrollRafId !== null) return;
	scrollRafId = requestAnimationFrame(() => {
		scrollRafId = null;
		isAtBottom.value = checkIsAtBottom();
	});
};

// Click the "back to bottom" button: scroll down and resume auto-follow
const handleScrollToBottom = () => {
	isAtBottom.value = true;
	scheduleScrollToBottom();
};

onMounted(() => {
	scrollportEl.value?.addEventListener("scroll", handleScroll, { passive: true });
});

onBeforeUnmount(() => {
	scrollportEl.value?.removeEventListener("scroll", handleScroll);
	if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
	if (rafId !== null) cancelAnimationFrame(rafId);
});

watch(
	() => {
		const lastMessage = props.messages[props.messages.length - 1];
		return {
			count: props.messages.length,
			lastId: lastMessage?.id,
			lastContent: lastMessage?.content,
			lastTail: lastMessage?.tailContent,
			lastLoading: lastMessage?.isLoading,
		};
	},
	async (newVal, oldVal) => {
		// Reset to "at bottom" state when the message list is replaced (conversation switch)
		if (newVal.count !== (oldVal?.count ?? 0) && (oldVal?.count ?? 0) === 0) {
			isAtBottom.value = true;
		}
		await nextTick();
		// Only auto-scroll when the user is already at the bottom
		if (isAtBottom.value) {
			scheduleScrollToBottom();
		}
	},
	{ immediate: true, flush: "post" }
);
</script>

<template>
	<!-- Full-width scrollport so the entire pane width scrolls (flex-safe: min-w-0). -->
	<section
		ref="scrollportEl"
		class="no-scrollbar relative min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-contain"
	>
		<!-- Narrow column for bubbles; section above stays full width so wheel/trackpad scroll works on margins. -->
		<div class="mx-auto w-full max-w-5xl min-w-0">
			<div class="flex w-full min-w-0 flex-col gap-3">
				<ChatMessage
					v-for="message in messages"
					:key="message.id"
					:message="message"
					:is-loading="Boolean(props.isSending && props.loadingMessageId === message.id)"
				/>
				<div ref="bottomEl" />
			</div>
		</div>

		<!-- Scroll-to-bottom button: shown when user has scrolled away from the bottom -->
		<Transition
			enter-active-class="transition-opacity duration-150"
			leave-active-class="transition-opacity duration-150"
			enter-from-class="opacity-0"
			leave-to-class="opacity-0"
		>
			<div v-if="!isAtBottom" class="sticky bottom-4 flex justify-center">
				<!-- Spinning ring wraps the button when LLM is streaming -->
				<div class="relative flex items-center justify-center">
					<span
						v-if="isSending"
						class="absolute size-11 animate-spin rounded-full border-2 border-transparent border-t-primary"
						aria-hidden="true"
					/>
					<Button
						variant="outline"
						size="icon"
						class="relative rounded-full shadow-md"
						aria-label="Scroll to bottom"
						@click="handleScrollToBottom"
					>
						<ArrowDown class="size-4" />
					</Button>
				</div>
			</div>
		</Transition>
	</section>
</template>

