<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import ChatMessage from "@/components/Chat/ChatMessage.vue";
import type { ChatMessageData } from "@/types/chat";

const props = defineProps<{
	messages: ChatMessageData[];
	loadingMessageId?: string | null;
	isSending?: boolean;
}>();
const bottomEl = ref<HTMLElement | null>(null);

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
	async () => {
		await nextTick();
		scheduleScrollToBottom();
	},
	{ immediate: true, flush: "post" }
);
</script>

<template>
	<!-- Full-width scrollport so the entire pane width scrolls (flex-safe: min-w-0). -->
	<section
		class="no-scrollbar min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-contain"
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
	</section>
</template>


