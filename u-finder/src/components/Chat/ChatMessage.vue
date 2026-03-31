<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { computed } from "vue";
import AIMessage from "@/components/Chat/AIMessage.vue";
import MessageFeedback from "@/components/Chat/MessageFeedback.vue";
import UniversityCard from "@/components/Chat/UniversityCard.vue";
import type { ChatMessageData } from "@/types/chat";

const props = defineProps<{ message: ChatMessageData; isLoading?: boolean }>();

const roleClass = computed(() =>
	props.message.role === "user"
		? "self-end text-left"
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

const searchingMarker = "<<__SEARCHING__>>";
const stripControlMarkers = (value: string) =>
	value.split(searchingMarker).join("");

// Serialize a single university card into a readable plain-text block
const cardToText = (card: NonNullable<ChatMessageData["cards"]>[number]): string => {
	const lines: string[] = [];
	const dp = card.degree_program;
	const loc = [card.university.city, card.university.country].filter(Boolean).join(", ");

	lines.push(`${card.university.name}${loc ? ` — ${loc}` : ""}`);
	lines.push(`${dp.name} (${dp.degree_level})`);
	if (card.faculty.name) lines.push(`Faculty: ${card.faculty.name}`);
	lines.push(`Field: ${dp.field}`);
	if (dp.track_or_specialization) lines.push(`Track: ${dp.track_or_specialization}`);
	if (dp.duration) lines.push(`Duration: ${dp.duration}`);
	if (dp.language) lines.push(`Language: ${dp.language}`);

	const adm = card.admissions;
	if (adm.application_deadline) lines.push(`Deadline: ${adm.application_deadline}`);
	if (adm.academic_requirements) lines.push(`Academic requirements: ${adm.academic_requirements}`);
	if (adm.language_requirements) lines.push(`Language requirements: ${adm.language_requirements}`);
	if (adm.other_requirements) lines.push(`Other requirements: ${adm.other_requirements}`);

	const t = card.tuition;
	if (t.amount !== null && t.currency) {
		lines.push(`Tuition: ${t.amount} ${t.currency}${t.per ? ` / ${t.per}` : ""}`);
	}

	if (card.career_outcomes?.length) {
		lines.push(`Career outcomes: ${card.career_outcomes.join(", ")}`);
	}

	lines.push(`URL: ${card.official_program_url}`);
	return lines.join("\n");
};

// Plain text for the copy button: strip common markdown syntax and append university card data
const plainTextContent = computed(() => {
	const parts: string[] = [];
	if (props.message.content) parts.push(stripControlMarkers(props.message.content));

	// Append each university card as a structured text block
	if (props.message.cards?.length) {
		for (const card of props.message.cards) {
			parts.push(cardToText(card));
		}
	}

	if (props.message.tailContent) parts.push(stripControlMarkers(props.message.tailContent));

	return parts.join("\n\n")
		.replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, "").trim())
		.replace(/#{1,6}\s+/g, "")
		.replace(/\*\*(.+?)\*\*/g, "$1")
		.replace(/\*(.+?)\*/g, "$1")
		.replace(/`(.+?)`/g, "$1")
		.replace(/\[(.+?)\]\(.+?\)/g, "$1")
		.replace(/^[>\-*+]\s+/gm, "")
		.trim();
});

// Show feedback bar once the AI message has finished streaming and has a Dify message ID
const showFeedback = computed(() =>
	props.message.role === "ai" &&
	!props.isLoading &&
	!props.message.isLoading &&
	!!props.message.difyMessageId
);
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

		<!-- Feedback bar: rendered below the bubble once streaming completes -->
		<MessageFeedback
			v-if="showFeedback"
			:message-id="message.difyMessageId!"
			:initial-feedback="message.feedback"
			:copy-content="plainTextContent"
		/>
	</article>
</template>