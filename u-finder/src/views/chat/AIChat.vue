<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import ChatWindow from "@/components/Chat/ChatWindow.vue";
import MessageInput from "@/components/Chat/InputMessage.vue";
import { streamChat } from "@/api/chatApi";
import { useUserStore } from "@/stores/userStore";
import type { ChatMessageData } from "@/types/chat";

const messages = ref<ChatMessageData[]>([]);
const isSending = ref(false);
const userStore = useUserStore();
const streamController = ref<AbortController | null>(null);
const conversationId = ref<string | null>(null);
let messageCounter = 1;

const stopStream = () => {
	streamController.value?.abort();
	streamController.value = null;
};

const updateMessage = (
	messageId: string,
	update: Partial<ChatMessageData>
) => {
	const message = messages.value.find((item) => item.id === messageId);
	if (!message) return;
	Object.assign(message, update);
};

const appendToMessage = (messageId: string, chunk: string) => {
	const message = messages.value.find((item) => item.id === messageId);
	if (!message) return;
	message.type = "text";
	message.content = `${message.content ?? ""}${chunk}`;
};

const handleSsePayload = (messageId: string, payload: string) => {
	if (!payload) return;
	if (payload === "[DONE]") return;

	let parsed: any;
	try {
		parsed = JSON.parse(payload);
	} catch {
		parsed = null;
	}

	if (!parsed) {
		appendToMessage(messageId, payload);
		return;
	}

	if (typeof parsed.conversation_id === "string" && !conversationId.value) {
		conversationId.value = parsed.conversation_id;
	}

	if (parsed.event === "message_end" || parsed.done === true) return;

	if (parsed.event === "agent_message" && typeof parsed.answer === "string") {
		appendToMessage(messageId, parsed.answer);
		return;
	}

	const cards =
		(parsed.type === "program_card" && parsed.payload?.programs) ||
		parsed.cards ||
		parsed.universities;
	if (Array.isArray(cards)) {
		updateMessage(messageId, { type: "cards", cards });
		return;
	}

	if (typeof parsed.text === "string") {
		appendToMessage(messageId, parsed.text);
		return;
	}

	if (typeof parsed.content === "string") {
		updateMessage(messageId, { type: "text", content: parsed.content });
	}
};

const startStream = async (prompt: string, messageId: string) => {
	stopStream();
	isSending.value = true;
	const { controller, done } = streamChat({
		message: prompt,
		conversationId: conversationId.value,
		token: userStore.user?.token,
		onPayload: (payload) => handleSsePayload(messageId, payload),
	});
	streamController.value = controller;

	try {
		await done;
	} catch (error) {
		if (streamController.value?.signal.aborted) return;
		const message = messages.value.find((item) => item.id === messageId);
		if (message && !message.content && !message.cards?.length) {
			updateMessage(messageId, {
				type: "text",
				content: "Sorry, I could not complete that request.",
			});
		}
	} finally {
		isSending.value = false;
		streamController.value = null;
	}
};

const handleSend = (text: string) => {
	const trimmed = text.trim();
	if (!trimmed || isSending.value) return;
	stopStream();

	messages.value.push({
		id: `m${messageCounter++}`,
		role: "user",
		type: "text",
		content: trimmed,
	});

	const aiMessageId = `m${messageCounter++}`;
	messages.value.push({
		id: aiMessageId,
		role: "ai",
		type: "text",
		content: "",
	});

	void startStream(trimmed, aiMessageId);
};

onBeforeUnmount(() => {
	stopStream();
});
</script>

<template>
	<div class="flex min-h-full w-full flex-col gap-6 p-2">
		<div
			v-if="!messages.length"
			class="flex flex-1 flex-col items-center justify-center gap-6 text-center"
		>
			<header class="space-y-1">
				<h1 class="text-3xl font-bold">U-Finder</h1>
				<p class="text-m text-muted-foreground">
					Find your best-fit university — powered by AI.
				</p>
			</header>

			<div class="w-full max-w-xl">
				<MessageInput
					:disabled="isSending"
					placeholder="Chat with U-Finder..."
					@send="handleSend"
				/>
			</div>
		</div>

		<div v-else class="flex min-h-0 flex-1 flex-col gap-4">
			<div class="min-h-0 flex-1 pt-8">
				<ChatWindow :messages="messages" />
			</div>

			<div class="pb-4">
				<MessageInput
					:disabled="isSending"
					placeholder="Chat with U-Finder..."
					@send="handleSend"
				/>
			</div>
		</div>
	</div>
</template>