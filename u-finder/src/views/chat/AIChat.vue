<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { useI18n } from "vue-i18n";
import ChatWindow from "@/components/Chat/ChatWindow.vue";
import MessageInput from "@/components/Chat/InputMessage.vue";
import { streamChat } from "@/api/chatApi";
import { useUserStore } from "@/stores/userStore";
import type { ChatMessageData } from "@/types/chat";
import type { ProgramCardData } from "@/types/chat";

const messages = ref<ChatMessageData[]>([]);
const isSending = ref(false);
const userStore = useUserStore();
const streamController = ref<AbortController | null>(null);
const conversationId = ref<string | null>(null);
const activeMessageId = ref<string | null>(null);
const { t } = useI18n();
let messageCounter = 1;
const programCardStart = "<<__CARD__>>";
const programCardEnd = "<<__END__>>";
const messageBuffers = new Map<string, string>();
const searchingMarker = "<<__SEARCHING__>>";

const stripControlMarkers = (value: string) =>
	value.split(searchingMarker).join("");

const findPartialStartSuffix = (value: string) => {
	const max = Math.min(value.length, programCardStart.length - 1);
	for (let size = max; size > 0; size -= 1) {
		if (programCardStart.startsWith(value.slice(-size))) {
			return size;
		}
	}
	return 0;
};

const extractProgramCards = (buffer: string) => {
	let remaining = buffer;
	let text = "";
	const cards: ProgramCardData[] = [];

	while (true) {
		const startIndex = remaining.indexOf(programCardStart);
		if (startIndex === -1) {
			const partialSize = findPartialStartSuffix(remaining);
			if (partialSize > 0) {
				text += stripControlMarkers(remaining.slice(0, -partialSize));
				remaining = remaining.slice(-partialSize);
			} else {
				text += stripControlMarkers(remaining);
				remaining = "";
			}
			break;
		}

		text += stripControlMarkers(remaining.slice(0, startIndex));
		const afterStart = remaining.slice(startIndex + programCardStart.length);
		const endIndex = afterStart.indexOf(programCardEnd);
		if (endIndex === -1) {
			remaining = remaining.slice(startIndex);
			break;
		}

		const payload = afterStart.slice(0, endIndex).trim();
		try {
			const parsed = JSON.parse(payload);
			const programs =
				(parsed?.type === "program_card" && parsed?.payload?.programs) ||
				parsed?.programs ||
				parsed;
			const list = Array.isArray(programs) ? programs : [programs];
			cards.push(...(list as ProgramCardData[]));
		} catch {
			remaining = remaining.slice(startIndex);
			break;
		}

		remaining = afterStart.slice(endIndex + programCardEnd.length);
	}

	return { text, cards, remainder: remaining };
};

const flushMessageBuffer = (messageId: string) => {
	const remainder = messageBuffers.get(messageId);
	if (!remainder) return;
	messageBuffers.delete(messageId);
	if (remainder.includes(programCardStart)) return;
	if (!remainder.trim()) return;
	const message = messages.value.find((item) => item.id === messageId);
	if (!message) return;
	if (message.cards?.length) {
		message.tailContent = `${message.tailContent ?? ""}${remainder}`;
		return;
	}
	message.type = "text";
	message.content = `${message.content ?? ""}${remainder}`;
};

const stopStream = () => {
	if (activeMessageId.value) {
		updateMessage(activeMessageId.value, { isLoading: false });
		activeMessageId.value = null;
	}
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
	const buffer = `${messageBuffers.get(messageId) ?? ""}${stripControlMarkers(chunk)}`;
	const { text, cards, remainder } = extractProgramCards(buffer);
	messageBuffers.set(messageId, remainder);
	if (text) {
		if (message.cards?.length) {
			message.tailContent = `${message.tailContent ?? ""}${text}`;
		} else {
			message.type = "text";
			message.content = `${message.content ?? ""}${text}`;
		}
	}
	if (cards.length) {
		const existing = message.cards ?? [];
		updateMessage(messageId, { type: "cards", cards: [...existing, ...cards] });
	}
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

	if (parsed.event === "message_end" || parsed.done === true) {
		flushMessageBuffer(messageId);
		return;
	}

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
		appendToMessage(messageId, stripControlMarkers(parsed.text));
		return;
	}

	if (typeof parsed.content === "string") {
		appendToMessage(messageId, stripControlMarkers(parsed.content));
	}
};

const startStream = async (prompt: string, messageId: string) => {
	stopStream();
	isSending.value = true;
	activeMessageId.value = messageId;
	updateMessage(messageId, { isLoading: true });
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
				content: t("chat.errors.streamFailed"),
			});
		}
	} finally {
		flushMessageBuffer(messageId);
		isSending.value = false;
		updateMessage(messageId, { isLoading: false });
		activeMessageId.value = null;
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
		isLoading: true,
	});

	void startStream(trimmed, aiMessageId);
};

onBeforeUnmount(() => {
	stopStream();
});
</script>

<template>
	<div class="flex h-full min-h-0 w-full flex-col gap-6 p-2">
		<div
			v-if="!messages.length"
			class="flex flex-1 flex-col items-center justify-center gap-6 text-center"
		>
			<header class="space-y-1">
				<h1 class="text-3xl font-bold">{{ t("chat.title") }}</h1>
				<p class="text-m text-muted-foreground">
					{{ t("chat.tagline") }}
				</p>
			</header>

			<div class="w-full max-w-xl">
				<MessageInput
					:disabled="isSending"
					:placeholder="t('chat.input.placeholder')"
					@send="handleSend"
				/>
			</div>
		</div>

		<div v-else class="flex min-h-0 flex-1 flex-col gap-4">
			<div class="flex min-h-0 flex-1 pt-8">
				<ChatWindow
					:messages="messages"
					:loading-message-id="activeMessageId"
					:is-sending="isSending"
				/>
			</div>

			<div class="pb-4 pt-2">
				<MessageInput
					:disabled="isSending"
					:placeholder="t('chat.input.placeholder')"
					@send="handleSend"
				/>
				<p class="mt-2 text-xs text-muted-foreground">
					{{ t("chat.input.disclaimer") }}
				</p>
			</div>
		</div>
	</div>
</template>