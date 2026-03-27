<script setup lang="ts">
import { computed } from "vue";
import AIMessage from "@/components/Chat/AIMessage.vue";
import UniversityCard from "@/components/Chat/UniversityCard.vue";
import type { ChatMessageData } from "@/types/chat";

const props = defineProps<{ message: ChatMessageData; isLoading?: boolean }>();

const roleClass = computed(() =>
	props.message.role === "user"
		? "self-end text-right"
		: "self-start text-left"
);

const containerClass = computed(() => {
	if (props.message.role === "user") {
		return "max-w-[90%] sm:max-w-[80%]";
	}
	if (props.message.type === "cards" || (props.message.cards?.length ?? 0) > 0) {
		return "max-w-full";
	}
	return "max-w-[95%] sm:max-w-[85%]";
});
</script>

<template>
	<article :class="['flex min-w-0 flex-col gap-2', roleClass, containerClass]">
		<div class="rounded-md border px-4 py-3 text-base">
			<AIMessage
				v-if="message.role === 'ai'"
				:content="message.content"
				:tail-content="message.tailContent"
				:universities="message.cards"
				:is-university-card-loading="Boolean(message.isUniversityCardLoading)"
				:is-loading="Boolean(props.isLoading || message.isLoading)"
			/>

			<p
				v-else-if="message.type === 'text'"
				class="whitespace-pre-line leading-relaxed text-foreground"
			>
				{{ message.content }}
			</p>

			<div v-else class="grid gap-3">
				<UniversityCard
					v-for="card in message.cards || []"
					:key="card.official_program_url || `${card.university.name}-${card.degree_program.name}`"
					:program="card"
				/>
			</div>
		</div>
	</article>
</template>