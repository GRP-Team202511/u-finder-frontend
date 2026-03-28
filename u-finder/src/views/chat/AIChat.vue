<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, inject } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { toast } from 'vue-sonner';
import ChatWindow from "@/components/Chat/ChatWindow.vue";
import MessageInput from "@/components/Chat/InputMessage.vue";
import { streamChat, getConversationMessages, stopChat } from "@/api/chatApi";
import { useUserStore } from "@/stores/userStore";
import type { ChatMessageData } from "@/types/chat";
import type { ProgramCardData } from "@/types/chat";

const messages = ref<ChatMessageData[]>([]);
const isSending = computed(() =>
	messages.value.some((message) => Boolean(message.isLoading))
);
const userStore = useUserStore();
const streamController = ref<AbortController | null>(null);
const activeStreamToken = ref<number | null>(null);
const conversationId = ref<string | null>(null);
const activeMessageId = ref<string | null>(null);
const activeTaskId = ref<string | null>(null);
const isStopping = ref(false);
const { t } = useI18n();
const addNewConversation = inject<((conversationId: string) => void) | undefined>('addNewConversation');
const route = useRoute();
const hasRefreshedConversations = ref(false);
let messageCounter = 1;
const programCardStart = "<<__CARD__>>";
const programCardEnd = "<<__END__>>";
const messageBuffers = new Map<string, string>();
const endedByServerMessages = new Set<string>();
const searchingMarker = "<<__SEARCHING__>>";

const ensureStoppedPlaceholder = (messageId: string) => {
	const message = messages.value.find((item) => item.id === messageId);
	if (!message) return;
	const hasContent =
		Boolean(message.content?.trim()) ||
		Boolean(message.tailContent?.trim()) ||
		Boolean(message.cards?.length);
	if (hasContent) return;
	message.type = "text";
	message.content = t("chat.stopped");
};

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
	Boolean(value) && typeof value === "object";

const isString = (value: unknown): value is string =>
	typeof value === "string";

const isNullableString = (value: unknown): value is string | null =>
	value === null || typeof value === "string";

const isNullableNumber = (value: unknown): value is number | null =>
	value === null || typeof value === "number";

const parseCardPrograms = (rawPayload: string): ProgramCardData[] | null => {
	const candidates: string[] = [];
	const trimmed = rawPayload.trim();
	candidates.push(trimmed);

	// Handle ```json ... ``` wrappers if the model emits fenced content.
	const withoutFence = trimmed
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/\s*```$/i, "")
		.trim();
	if (withoutFence && withoutFence !== trimmed) {
		candidates.push(withoutFence);
	}

	// Handle noisy prefixes/suffixes by slicing to the outermost JSON object.
	const firstBrace = withoutFence.indexOf("{");
	const lastBrace = withoutFence.lastIndexOf("}");
	if (firstBrace !== -1 && lastBrace > firstBrace) {
		const objectSlice = withoutFence.slice(firstBrace, lastBrace + 1).trim();
		if (objectSlice && !candidates.includes(objectSlice)) {
			candidates.push(objectSlice);
		}
	}

	for (const candidate of candidates) {
		try {
			const parsed = JSON.parse(candidate);
			const programs =
				(parsed?.type === "program_card" && parsed?.payload?.programs) ||
				parsed?.programs ||
				parsed;
			const list = Array.isArray(programs) ? programs : [programs];
			if (list.length) return list as ProgramCardData[];
		} catch {
			// Retry with a minimal trailing-comma cleanup.
			try {
				const sanitized = candidate.replace(/,\s*([}\]])/g, "$1");
				const parsed = JSON.parse(sanitized);
				const programs =
					(parsed?.type === "program_card" && parsed?.payload?.programs) ||
					parsed?.programs ||
					parsed;
				const list = Array.isArray(programs) ? programs : [programs];
				if (list.length) return list as ProgramCardData[];
			} catch {
				// Try next candidate.
			}
		}
	}

	return null;
};

const isProgramCardLike = (value: unknown): value is ProgramCardData => {
	if (!isRecord(value)) return false;

	const university = value.university;
	if (!isRecord(university)) return false;
	if (!isString(university.name)) return false;
	if (!isNullableString(university.country)) return false;
	if (!isNullableString(university.city)) return false;
	if (!isString(university.official_website)) return false;

	const faculty = value.faculty;
	if (!isRecord(faculty)) return false;
	if (!isNullableString(faculty.name)) return false;
	if (!isNullableString(faculty.official_website)) return false;

	const degreeProgram = value.degree_program;
	if (!isRecord(degreeProgram)) return false;
	if (!isString(degreeProgram.name)) return false;
	if (!isString(degreeProgram.degree_level)) return false;
	if (!isString(degreeProgram.field)) return false;
	if (!isNullableString(degreeProgram.track_or_specialization)) return false;
	if (!isString(degreeProgram.program_type)) return false;
	if (!isNullableString(degreeProgram.duration)) return false;
	if (!isNullableString(degreeProgram.language)) return false;

	const admissions = value.admissions;
	if (!isRecord(admissions)) return false;
	if (!isNullableString(admissions.academic_requirements)) return false;
	if (!isNullableString(admissions.language_requirements)) return false;
	if (!isNullableString(admissions.other_requirements)) return false;
	if (!isNullableString(admissions.application_deadline)) return false;

	const tuition = value.tuition;
	if (!isRecord(tuition)) return false;
	if (!isNullableNumber(tuition.amount)) return false;
	if (!isNullableString(tuition.currency)) return false;
	if (!isNullableString(tuition.per)) return false;

	if (!(value.career_outcomes === null || (Array.isArray(value.career_outcomes) && value.career_outcomes.every(isString)))) {
		return false;
	}

	if (!isString(value.official_program_url)) return false;
	if (!isString(value.last_verified)) return false;

	return true;
};

const normalizeProgramCards = (cards: ProgramCardData[]) =>
	cards.filter((card) => isProgramCardLike(card));

const extractProgramCards = (buffer: string) => {
	let remaining = buffer;
	let preText = "";
	let postText = "";
	const cards: ProgramCardData[] = [];
	let hasSeenCard = false;

	const appendText = (value: string) => {
		if (!value) return;
		if (hasSeenCard) {
			postText += value;
		} else {
			preText += value;
		}
	};

	while (true) {
		const startIndex = remaining.indexOf(programCardStart);
		if (startIndex === -1) {
			const partialSize = findPartialStartSuffix(remaining);
			if (partialSize > 0) {
				appendText(stripControlMarkers(remaining.slice(0, -partialSize)));
				remaining = remaining.slice(-partialSize);
			} else {
				appendText(stripControlMarkers(remaining));
				remaining = "";
			}
			break;
		}

		appendText(stripControlMarkers(remaining.slice(0, startIndex)));
		const afterStart = remaining.slice(startIndex + programCardStart.length);
		const endIndex = afterStart.indexOf(programCardEnd);
		if (endIndex === -1) {
			remaining = remaining.slice(startIndex);
			break;
		}

		const payload = afterStart.slice(0, endIndex).trim();
		const parsedCards = parseCardPrograms(payload);
		if (parsedCards?.length) {
			const validCards = normalizeProgramCards(parsedCards);
			if (validCards.length > 0) {
				cards.push(...validCards);
				hasSeenCard = true;
			} else {
				appendText(stripControlMarkers(payload));
			}
		} else {
			// Recovery path: treat unparseable payload as text to avoid stuck buffers.
			appendText(stripControlMarkers(payload));
		}

		remaining = afterStart.slice(endIndex + programCardEnd.length);
	}

	return { preText, postText, cards, remainder: remaining };
};

const flushMessageBuffer = (messageId: string, options?: { discardIncompleteCards?: boolean }) => {
	const remainder = messageBuffers.get(messageId);
	if (!remainder) return;
	messageBuffers.delete(messageId);
	const hasFullCardStart = remainder.includes(programCardStart);
	const partialStartSuffixSize = findPartialStartSuffix(remainder);
	const hasPartialCardStart = partialStartSuffixSize > 0;
	if (options?.discardIncompleteCards && (hasFullCardStart || hasPartialCardStart)) {
		return;
	}
	const remainderWithoutPartialSuffix = hasPartialCardStart
		? remainder.slice(0, -partialStartSuffixSize)
		: remainder;
	const sanitizedRemainder = stripControlMarkers(
		remainderWithoutPartialSuffix.split(programCardStart).join("").split(programCardEnd).join("")
	);
	if (hasFullCardStart) {
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
		ensureStoppedPlaceholder(activeMessageId.value);
		updateMessage(activeMessageId.value, {
			isLoading: false,
			isUniversityCardLoading: false,
		});
		activeMessageId.value = null;
	}
	streamController.value?.abort();
	streamController.value = null;
	activeStreamToken.value = null;
	activeTaskId.value = null;
};

const handleStop = async () => {
	if (isStopping.value || !isSending.value) return;
	isStopping.value = true;
	try {
		if (activeTaskId.value) {
			await stopChat(activeTaskId.value);
		}
	} catch (error) {
		console.error("Failed to stop chat task", error);
		toast.error(t("chat.errors.stopFailed"));
	} finally {
		stopStream();
		isStopping.value = false;
	}
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
	const { preText, postText, cards, remainder } = extractProgramCards(buffer);
	messageBuffers.set(messageId, remainder);
	const hasFullCardMarker = remainder.includes(programCardStart);
	const hasPartialCardMarker = findPartialStartSuffix(remainder) > 0;
	const isUniversityCardLoading = hasFullCardMarker || hasPartialCardMarker;
	message.isUniversityCardLoading = isUniversityCardLoading;
	const hasCardsAlready = Boolean(message.cards?.length);
	const validCards = cards;
	const cardsAdded = validCards.length > 0;
	if (preText) {
		if (hasCardsAlready) {
			message.tailContent = `${message.tailContent ?? ""}${preText}`;
		} else {
			message.type = "text";
			message.content = `${message.content ?? ""}${preText}`;
		}
	}
	if (postText) {
		if (hasCardsAlready || cardsAdded) {
			message.tailContent = `${message.tailContent ?? ""}${postText}`;
		} else {
			message.type = "text";
			message.content = `${message.content ?? ""}${postText}`;
		}
	}
	if (cardsAdded) {
		const existing = message.cards ?? [];
		updateMessage(messageId, {
			type: "cards",
			cards: [...existing, ...validCards],
			isUniversityCardLoading,
		});
	}
};

const handleSsePayload = (messageId: string, payload: string) => {
	if (!payload) return;
	if (payload === "[DONE]") {
		endedByServerMessages.add(messageId);
		flushMessageBuffer(messageId);
		updateMessage(messageId, { isUniversityCardLoading: false });
		if (activeMessageId.value === messageId) {
			streamController.value?.abort();
		}
		return;
	}

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
		// Save to sessionStorage
		sessionStorage.setItem('currentConversationId', parsed.conversation_id);
		// Trigger event to notify ConversationList to update highlight state
		window.dispatchEvent(new CustomEvent('conversation-changed', { 
			detail: { conversationId: parsed.conversation_id } 
		}));
		// Add new conversation locally only on first conversationId received
		if (!hasRefreshedConversations.value) {
			hasRefreshedConversations.value = true;
			addNewConversation?.(parsed.conversation_id);
		}
	}

	const taskIdFromPayload =
		typeof parsed.task_id === "string"
			? parsed.task_id
			: typeof parsed.taskId === "string"
				? parsed.taskId
				: typeof parsed?.data?.task_id === "string"
					? parsed.data.task_id
					: null;
	if (taskIdFromPayload) {
		activeTaskId.value = taskIdFromPayload;
	}

	if (parsed.event === "message_end" || parsed.done === true) {
		endedByServerMessages.add(messageId);
		flushMessageBuffer(messageId);
		updateMessage(messageId, { isUniversityCardLoading: false });
		if (activeMessageId.value === messageId) {
			streamController.value?.abort();
		}
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
		const validCards = normalizeProgramCards(cards as ProgramCardData[]);
		updateMessage(messageId, {
			type: "cards",
			cards: validCards,
			isUniversityCardLoading: false,
		});
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
	activeTaskId.value = null;
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
		const streamWasAborted = controller.signal.aborted;
		const endedByServer = endedByServerMessages.has(messageId);
		endedByServerMessages.delete(messageId);
		flushMessageBuffer(messageId, {
			discardIncompleteCards: streamWasAborted && !endedByServer,
		});
		if (activeStreamToken.value === streamToken) {
			updateMessage(messageId, {
				isLoading: false,
				isUniversityCardLoading: false,
			});
			activeMessageId.value = null;
			streamController.value = null;
			activeStreamToken.value = null;
			activeTaskId.value = null;
			isStopping.value = false;
		}
	}
};

const loadHistoryMessages = async (convId: string) => {
	try {
		const response = await getConversationMessages({
			conversationId: convId,
		});
		
		// Clear current messages
		messages.value = [];
		messageCounter = 1;
		
		// Convert history message format
		for (const msg of response.data) {
			// Add user message
			messages.value.push({
				id: `m${messageCounter++}`,
				role: "user",
				type: "text",
				content: msg.query,
			});
			
			// Add AI reply
			const aiMessage: ChatMessageData = {
				id: `m${messageCounter++}`,
				role: "ai",
				type: "text",
				content: "",
			};
			
			// Get AI reply content: prefer `answer`; if empty, fall back to `agent_thoughts`
			let aiContent = msg.answer;
			if (!aiContent || aiContent.trim() === '') {
				// `answer` is empty — attempt to extract from `agent_thoughts`
				if (msg.agent_thoughts && msg.agent_thoughts.length > 0) {
					// Sort by `position` and concatenate contents
					// Filter out tool use thoughts (those with non-empty `tool` property)
					const sortedThoughts = [...msg.agent_thoughts]
						.filter(thought => !thought.tool || thought.tool.trim() === '')
						.sort((a, b) => a.position - b.position);
					aiContent = sortedThoughts
						.map(thought => {
							const parts: string[] = [];
							if (thought.thought) parts.push(thought.thought);
							if (thought.observation) parts.push(thought.observation);
							return parts.join('\n');
						})
						.filter(content => content.trim())
						.join('\n\n');
				}
			}
			
			// Parse program card
			const { preText, postText, cards } = extractProgramCards(aiContent || '');
			
			if (cards.length > 0) {
				aiMessage.type = "cards";
				aiMessage.cards = cards;
				if (preText.trim()) {
					aiMessage.content = preText.trim();
				}
				if (postText.trim()) {
					aiMessage.tailContent = postText.trim();
				}
			} else {
				aiMessage.type = "text";
				const finalText = (preText || aiContent || '').trim();
				aiMessage.content = finalText || t("chat.stopped");
			}
			
			messages.value.push(aiMessage);
		}
		
		// Set current conversationId
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
		isUniversityCardLoading: false,
	});

	void startStream(trimmed, aiMessageId);
};

// Handle conversation switching
const handleConversationChange = (convId: string | null) => {
	// Ignore if same as current conversationId
	if (convId && convId === conversationId.value) return;
	
	// Stop current stream
	stopStream();
	
	if (convId) {
		// Load history conversation
		void loadHistoryMessages(convId);
	} else {
		// New conversation: clear messages and reset refresh flag
		messages.value = [];
		conversationId.value = null;
		messageCounter = 1;
		hasRefreshedConversations.value = false;
	}
};

// Listen to custom event (triggered from Sidebar)
const onConversationChanged = (event: CustomEvent) => {
	const { conversationId: newConvId } = event.detail;
	handleConversationChange(newConvId);
};

onMounted(() => {
	// Check for a pending comparison prompt injected by the Favourite page.
	// It takes priority over any saved conversation so a fresh chat is started.
	const pendingPrompt = sessionStorage.getItem('pendingComparisonPrompt');
	if (pendingPrompt) {
		sessionStorage.removeItem('pendingComparisonPrompt');
		// Use nextTick-equivalent: defer until the component is fully rendered
		// so that handleSend can push messages into the already-mounted ChatWindow.
		setTimeout(() => handleSend(pendingPrompt), 0);
	} else {
		// Read current conversation from sessionStorage, unless a new conversation was requested
		const isNewConversation = route.query.new === '1';
		if (isNewConversation) {
			sessionStorage.removeItem('currentConversationId');
		} else {
			const savedConvId = sessionStorage.getItem('currentConversationId');
			if (savedConvId) {
				handleConversationChange(savedConvId);
			}
		}
	}

	// Listen to conversation change events
	window.addEventListener('conversation-changed', onConversationChanged as EventListener);
});

onBeforeUnmount(() => {
	stopStream();
	window.removeEventListener('conversation-changed', onConversationChanged as EventListener);
});
</script>

<template>
	<!-- relative + absolute hero: vertical center of the available panel, independent of footer / textarea height -->
	<div class="relative flex h-full w-full min-h-0 min-w-0 flex-col">
		<div class="flex min-h-0 w-full min-w-0 flex-1 flex-col">
			<!-- Empty chat: only a flex spacer so the composer stays at the bottom -->
			<div v-if="!messages.length" class="min-h-0 min-w-0 flex-1" />

			<!-- Full-width scroll; fade strip lives on the footer so it aligns with the composer top (no flex gap / pt offset). -->
			<div
				v-else
				class="flex min-h-0 w-full min-w-0 flex-1 flex-col pt-4 sm:pt-6"
			>
				<ChatWindow
					:messages="messages"
					:loading-message-id="activeMessageId"
					:is-sending="isSending"
				/>
			</div>
		</div>

		<!-- Viewport-panel center (top-1/2 of this shell), not the flex slot above the footer -->
		<div
			v-if="!messages.length"
			class="pointer-events-none absolute inset-x-2 top-1/2 z-0 flex -translate-y-1/2 justify-center text-center"
		>
			<header class="pointer-events-auto space-y-1 px-2">
				<h1 class="text-2xl font-bold sm:text-3xl">{{ t("chat.title") }}</h1>
				<p class="text-sm text-muted-foreground sm:text-base">
					{{ t("chat.tagline") }}
				</p>
			</header>
		</div>

		<div class="relative z-10 w-full shrink-0 px-1 pb-3 sm:px-2 sm:pb-4">
			<div
				v-if="messages.length"
				class="pointer-events-none absolute inset-x-0 top-0 z-1 h-[20px] -translate-y-full bg-linear-to-t from-background to-transparent"
				aria-hidden="true"
			/>
			<div class="mx-auto w-full max-w-5xl">
				<MessageInput
					:is-sending="isSending"
					:stop-disabled="isStopping"
					:placeholder="t('chat.input.placeholder')"
					@send="handleSend"
					@stop="handleStop"
				/>
				<p class="mt-2 text-center text-xs text-muted-foreground">
					{{ t("chat.input.disclaimer") }}
				</p>
			</div>
		</div>
	</div>
</template>