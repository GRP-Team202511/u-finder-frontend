<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProgramCardData } from "@/types/chat";

const props = defineProps<{
	program: ProgramCardData;
	/** Whether the card is in multi-select / compare mode */
	selectable?: boolean;
	/** Whether this card is currently selected for comparison */
	selected?: boolean;
}>();
const emit = defineEmits<{
	(e: "show-details", program: ProgramCardData): void;
	(e: "remove", program: ProgramCardData): void;
	/** Emitted when the user clicks the card or checkbox in selectable mode */
	(e: "toggle-select", program: ProgramCardData): void;
}>();

const { t, locale } = useI18n();

const locationLabel = computed(() => {
	const parts = [props.program.university.city, props.program.university.country].filter(
		(value) => Boolean(value),
	);
	return parts.length > 0 ? parts.join(", ") : t("chat.card.locationNotSpecified");
});

const tuitionLabel = computed(() => {
	const { amount, currency, per } = props.program.tuition;
	if (amount === null || !currency) {
		return t("chat.card.tuitionNotSpecified");
	}
	const formattedAmount = new Intl.NumberFormat(locale.value).format(amount);
	return `${currency} ${formattedAmount}${per ? ` / ${per}` : ""}`;
});
</script>

<template>
	<!-- Wrap in a relative container to allow the selection overlay to be positioned absolutely -->
	<div
		class="relative"
		:class="{ 'cursor-pointer': selectable }"
		@click="selectable ? emit('toggle-select', program) : undefined"
	>
		<Card
			class="transition-all"
			:class="{
				'ring-2 ring-primary ring-offset-2': selectable && selected,
				'opacity-60': selectable && !selected,
				'hover:ring-2 hover:ring-primary/50 hover:opacity-100': selectable && !selected,
			}"
		>
			<CardHeader class="h-[112px] max-h-[112px] min-h-[112px] gap-2 overflow-hidden pb-4">
				<div class="flex h-full items-start justify-between gap-4">
					<div class="min-w-0 space-y-1">
						<CardTitle class="line-clamp-2 text-lg font-semibold leading-snug">
							{{ program.university.name }}
						</CardTitle>
						<CardDescription>{{ locationLabel }}</CardDescription>
					</div>
					<div class="min-w-0 text-right text-xs text-muted-foreground">
						<p class="uppercase tracking-wide">{{ t("chat.card.program") }}</p>
						<p class="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
							{{ program.degree_program.name }}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex flex-wrap items-center gap-3 text-sm">
					<span class="rounded-full bg-muted px-3 py-1 text-muted-foreground">
						{{ program.degree_program.degree_level }}
					</span>
					<span class="rounded-full bg-muted px-3 py-1 text-muted-foreground">
						{{ program.degree_program.field }}
					</span>
					<span class="rounded-full bg-muted px-3 py-1 text-muted-foreground">
						{{ tuitionLabel }}
					</span>
				</div>
				<!-- Hide action buttons when in selectable/compare mode -->
				<div v-if="!selectable" class="flex flex-wrap justify-end gap-2">
					<Button size="sm" variant="outline" @click="emit('show-details', program)">
						{{ t("favourites.actions.showDetails") }}
					</Button>
					<Button size="sm" variant="secondary" @click="emit('remove', program)">
						{{ t("favourites.actions.remove") }}
					</Button>
				</div>
			</CardContent>
		</Card>

		<!-- Checkbox indicator shown in the top-left corner during compare mode -->
		<div
			v-if="selectable"
			class="pointer-events-none absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
			:class="selected ? 'border-primary bg-primary' : 'border-muted-foreground bg-background'"
			aria-hidden="true"
		>
			<!-- Checkmark icon shown when selected -->
			<svg
				v-if="selected"
				class="h-3 w-3 text-primary-foreground"
				viewBox="0 0 12 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</div>
	</div>
</template>
