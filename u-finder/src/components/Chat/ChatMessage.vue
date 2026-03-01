<script setup lang="ts">
import { computed } from "vue";
import UniversityCard from "@/components/Chat/UniversityCard.vue";

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

const props = defineProps<{ message: ChatMessageData }>();

const roleClass = computed(() =>
	props.message.role === "user"
		? "self-end text-right"
		: "self-start text-left"
);
</script>

<template>
	<article :class="['flex max-w-[80%] flex-col gap-2', roleClass]">
		<div class="rounded-md border px-4 py-3 text-sm">
			<p v-if="message.type === 'text'" class="leading-relaxed text-foreground">
				{{ message.content }}
			</p>

			<div v-else class="grid gap-3">
				<UniversityCard
					v-for="card in message.cards || []"
					:key="card.id"
					:university="card"
				/>
			</div>
		</div>
	</article>
</template>