<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import ChatMessage from "@/components/Chat/ChatMessage.vue";
import type { ChatMessageData } from "@/types/chat";

const props = defineProps<{
	messages: ChatMessageData[];
	loadingMessageId?: string | null;
	isSending?: boolean;
}>();
const scrollEl = ref<HTMLElement | null>(null);
const bottomEl = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
	const anchor = bottomEl.value;
	if (!anchor) return;
	anchor.scrollIntoView({ block: "end" });
};

watch(
	() => props.messages,
	async () => {
		await nextTick();
		requestAnimationFrame(() => {
			scrollToBottom();
		});
	},
	{ immediate: true, deep: true, flush: "post" }
);
</script>

<template>
	<section ref="scrollEl" class="no-scrollbar min-h-0 flex-1 overflow-y-auto">
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


