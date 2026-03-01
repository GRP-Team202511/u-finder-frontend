<script setup lang="ts">
import { ref } from "vue";
import ChatWindow from "@/components/Chat/ChatWindow.vue";
import MessageInput from "@/components/Chat/InputMessage.vue";

type UniversityCardData = {
	id: string;
	name: string;
	location: string;
	program: string;
	tuition: string;
	rating: string;
	highlights: string[];
};

type ChatMessage = {
	id: string;
	role: "user" | "ai";
	type: "text" | "cards";
	content?: string;
	cards?: UniversityCardData[];
};

const messages = ref<ChatMessage[]>([]);

const isSending = ref(false);
let messageCounter = 3;

const buildCardsResponse = (): ChatMessage => ({
	id: `m${messageCounter++}`,
	role: "ai",
	type: "cards",
	cards: [
		{
			id: "u3",
			name: "Harborlight University",
			location: "Sydney, Australia",
			program: "BEng Software Engineering",
			tuition: "$28,400 / year",
			rating: "4.5",
			highlights: ["Global exchange", "Startup incubator", "Beach campus"],
		},
		{
			id: "u4",
			name: "Stonemill College",
			location: "Bristol, UK",
			program: "MSc Human-Computer Interaction",
			tuition: "$22,900 / year",
			rating: "4.4",
			highlights: ["UX studio", "Flexible modules", "Small cohorts"],
		},
	],
});

const buildTextResponse = (): ChatMessage => ({
	id: `m${messageCounter++}`,
	role: "ai",
	type: "text",
	content:
		"Thanks! I can refine results by GPA, test scores, and budget range. Want me to filter further?",
});

const handleSend = (text: string) => {
	const trimmed = text.trim();
	if (!trimmed || isSending.value) return;

	messages.value.push({
		id: `m${messageCounter++}`,
		role: "user",
		type: "text",
		content: trimmed,
	});

	isSending.value = true;
	window.setTimeout(() => {
		const wantsCards = /university|college|program|course/i.test(trimmed);
		messages.value.push(wantsCards ? buildCardsResponse() : buildTextResponse());
		isSending.value = false;
	}, 450);
};
</script>

<template>
	<div class="flex min-h-full w-full flex-col gap-6 p-2">
		<div
			v-if="!messages.length"
			class="flex flex-1 flex-col items-center justify-center gap-6 text-center"
		>
			<header class="space-y-1">
				<h1 class="text-3xl font-bold">U-Finder</h1>
				<p class="text-sm text-muted-foreground">
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

		<div v-else class="flex flex-1 flex-col gap-4">
			<div class="flex-1 pt-8">
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