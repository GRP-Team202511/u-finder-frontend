<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import ChatMessage from "@/components/Chat/ChatMessage.vue";

type UniversityCardData = {
	id: string;
	name: string;
	location: string;
	program: string;
	tuition: string;
	rating: string;
	highlights: string[];
};

type ChatMessageData = {
	id: string;
	role: "user" | "ai";
	type: "text" | "cards";
	content?: string;
	cards?: UniversityCardData[];
};

const props = defineProps<{ messages: ChatMessageData[] }>();
const scrollEl = ref<HTMLElement | null>(null);

watch(
	() => props.messages.length,
	async () => {
		await nextTick();
		if (scrollEl.value) {
			scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
		}
	},
	{ immediate: true }
);
</script>

<template>
	<section ref="scrollEl" class="flex-1 overflow-y-auto">
		<div class="flex flex-col gap-3">
			<ChatMessage
				v-for="message in messages"
				:key="message.id"
				:message="message"
			/>
		</div>
	</section>
</template>


