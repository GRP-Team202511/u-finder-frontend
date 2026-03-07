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
	<section class="no-scrollbar min-h-0 flex-1 overflow-y-auto">
		<div class="flex flex-col gap-3">
			<ChatMessage
				v-for="message in messages"
				:key="message.id"
				:message="message"
				:is-loading="Boolean(props.isSending && props.loadingMessageId === message.id)"
			/>
			<div ref="bottomEl" />
		</div>
	</section>
</template>


