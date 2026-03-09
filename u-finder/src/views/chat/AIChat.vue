<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { toast } from 'vue-sonner';
import ChatWindow from "@/components/Chat/ChatWindow.vue";
import MessageInput from "@/components/Chat/InputMessage.vue";
import { streamChat, getConversationMessages } from "@/api/chatApi";
import { useUserStore } from "@/stores/userStore";
import type { ChatMessageData } from "@/types/chat";
import type { ProgramCardData } from "@/types/chat";

const messages = ref<ChatMessageData[]>([]);
const isSending = computed(() =>
	messages.value.some((message) => Boolean(message.isLoading))
);
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const streamController = ref<AbortController | null>(null);
const activeStreamToken = ref<number | null>(null);
const conversationId = ref<string | null>(null);
const activeMessageId = ref<string | null>(null);
const { t } = useI18n();
const refreshConversations = inject<(() => void) | undefined>('refreshConversations');
const hasRefreshedConversations = ref(false);
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
	const sanitizedRemainder = stripControlMarkers(
		remainder.split(programCardStart).join("").split(programCardEnd).join("")
	);
	if (remainder.includes(programCardStart)) {
		if (!sanitizedRemainder.trim()) return;
		const message = messages.value.find((item) => item.id === messageId);
		if (!message) return;
		if (message.cards?.length) {
			message.tailContent = `${message.tailContent ?? ""}${sanitizedRemainder}`;
			return;
		}
		message.type = "text";
		message.content = `${message.content ?? ""}${sanitizedRemainder}`;
		return;
	}
	if (!sanitizedRemainder.trim()) return;
	const message = messages.value.find((item) => item.id === messageId);
	if (!message) return;
	if (message.cards?.length) {
		message.tailContent = `${message.tailContent ?? ""}${sanitizedRemainder}`;
		return;
	}
	message.type = "text";
	message.content = `${message.content ?? ""}${sanitizedRemainder}`;
};

const stopStream = () => {
	if (activeMessageId.value) {
		updateMessage(activeMessageId.value, { isLoading: false });
		activeMessageId.value = null;
	}
	streamController.value?.abort();
	streamController.value = null;
	activeStreamToken.value = null;
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
		// 只在第一次收到 conversationId 时刷新 Sidebar
		if (!hasRefreshedConversations.value) {
			hasRefreshedConversations.value = true;
			refreshConversations?.();
		}
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
	activeMessageId.value = messageId;
	updateMessage(messageId, { isLoading: true });
	const streamToken = (activeStreamToken.value ?? 0) + 1;
	activeStreamToken.value = streamToken;
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
		if (activeStreamToken.value !== streamToken) return;
		const message = messages.value.find((item) => item.id === messageId);
		if (message && !message.content && !message.cards?.length) {
			updateMessage(messageId, {
				type: "text",
				content: t("chat.errors.streamFailed"),
			});
		}
	} finally {
		flushMessageBuffer(messageId);
		if (activeStreamToken.value === streamToken) {
			updateMessage(messageId, { isLoading: false });
			activeMessageId.value = null;
			streamController.value = null;
			activeStreamToken.value = null;
		}
	}
};

const loadHistoryMessages = async (convId: string) => {
	try {
		const response = await getConversationMessages({
			conversationId: convId,
		});
		
		// 清空当前消息
		messages.value = [];
		messageCounter = 1;
		
		// 转换历史消息格式
		for (const msg of response.data) {
			// 添加用户消息
			messages.value.push({
				id: `m${messageCounter++}`,
				role: "user",
				type: "text",
				content: msg.query,
			});
			
			// 添加 AI 回复
			const aiMessage: ChatMessageData = {
				id: `m${messageCounter++}`,
				role: "ai",
				type: "text",
				content: "",
			};
			
			// 解析 answer 中的程序卡片
			const { text, cards } = extractProgramCards(msg.answer);
			
			if (cards.length > 0) {
				aiMessage.type = "cards";
				aiMessage.cards = cards;
				if (text.trim()) {
					aiMessage.tailContent = text;
				}
			} else {
				aiMessage.type = "text";
				aiMessage.content = text || msg.answer;
			}
			
			messages.value.push(aiMessage);
		}
		
		// 设置当前 conversationId
		conversationId.value = convId;
	} catch (error) {
		console.error('Failed to load conversation history:', error);
		toast.error(t('chat.errors.loadHistoryFailed'));
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

// 监听路由参数变化
watch(
	() => route.params.conversationId,
	(newConvId) => {
		// 停止当前流
		stopStream();
		
		if (newConvId && typeof newConvId === 'string') {
			// 加载历史对话
			void loadHistoryMessages(newConvId);
		} else {
			// 新对话：清空消息并重置刷新标志
			messages.value = [];
			conversationId.value = null;
			messageCounter = 1;
			hasRefreshedConversations.value = false;
		}
	},
	{ immediate: true }
);

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