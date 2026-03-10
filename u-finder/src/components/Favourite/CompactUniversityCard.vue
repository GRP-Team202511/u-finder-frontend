<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProgramCardData } from "@/types/chat";

const props = defineProps<{ program: ProgramCardData }>();
const emit = defineEmits<{ (e: "show-details", program: ProgramCardData): void; (e: "remove", program: ProgramCardData): void }>();

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
	<Card>
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
			<div class="flex flex-wrap justify-end gap-2">
				<Button size="sm" variant="outline" @click="emit('show-details', program)">
					{{ t("favourites.actions.showDetails") }}
				</Button>
				<Button size="sm" variant="secondary" @click="emit('remove', program)">
					{{ t("favourites.actions.remove") }}
				</Button>
			</div>
		</CardContent>
	</Card>
</template>
