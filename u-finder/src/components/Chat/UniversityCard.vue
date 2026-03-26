<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-vue-next"
import { extractProgram, programKey, useFavouriteStore } from "@/stores/favouriteStore";

import type { ProgramCardData } from "@/types/chat";

const props = defineProps<{ program: ProgramCardData }>();

const selectedView = ref("program");
const { t, locale } = useI18n();
const favouriteStore = useFavouriteStore();
const { items } = storeToRefs(favouriteStore);

const isFavourite = computed(() => {
	const key = programKey(props.program);
	return items.value.some((item) => programKey(extractProgram(item)) === key);
});

const locationLabel = () => {
	const parts = [props.program.university.city, props.program.university.country].filter(
		(value) => Boolean(value),
	);
	return parts.length > 0 ? parts.join(", ") : t("chat.card.locationNotSpecified");
};

const tuitionLabel = () => {
	const { amount, currency, per } = props.program.tuition;
	if (amount === null || !currency) {
		return t("chat.card.tuitionNotSpecified");
	}
	const formattedAmount = new Intl.NumberFormat(locale.value).format(amount);
	return `${currency} ${formattedAmount}${per ? ` / ${per}` : ""}`;
};

const formatLanguageRequirements = () => {
	const requirements = props.program.admissions.language_requirements;
	if (!requirements) {
		return t("chat.card.notSpecified");
	}
	return requirements.trim() || t("chat.card.notSpecified");
};

const formatVerifiedDate = () => {
	const rawDate = props.program.last_verified;
	const parsed = new Date(rawDate);
	if (Number.isNaN(parsed.getTime())) {
		return rawDate || t("chat.card.notSpecified");
	}
	return new Intl.DateTimeFormat(locale.value, {
		year: "numeric",
		month: "short",
		day: "2-digit",
	}).format(parsed);
};

const handleToggleFavourite = async () => {
	const wasFavourite = isFavourite.value;
	try {
		if (wasFavourite) {
			await favouriteStore.remove(props.program);
			toast.success(t("favourites.toast.removeSuccess"));
			return;
		}
		await favouriteStore.add(props.program);
		toast.success(t("favourites.toast.addSuccess"));
	} catch (error) {
		const messageKey = wasFavourite
			? "favourites.toast.removeFailed"
			: "favourites.toast.addFailed";
		toast.error(t(messageKey));
		console.error("Failed to update favourite", error);
	}
};
</script>

<template>
	<Card class="w-full min-w-0">
		<CardHeader>
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<CardTitle class = "text-2xl font-bold">
						{{ program.university.name }}
					</CardTitle>
					<CardDescription class="mt-1 text-sm">
						{{ locationLabel() }}
					</CardDescription>
				</div>
				<button
					type="button"
					class="rounded-md p-2 transition"
					:class="isFavourite ? 'text-yellow-500 hover:text-yellow-400' : 'text-muted-foreground hover:text-foreground'"
					:aria-label="isFavourite ? t('favourites.actions.remove') : t('favourites.actions.add')"
					:aria-pressed="isFavourite"
					:title="isFavourite ? t('favourites.actions.remove') : t('favourites.actions.add')"
					@click="void handleToggleFavourite()"
				>
					<Star class="h-5 w-5" :fill="isFavourite ? 'currentColor' : 'none'" />
				</button>
			</div>
		</CardHeader>
		<CardContent class="text-base">
			<div class = "pb-8">
				<p class="text-sm text-foreground">{{ t("chat.card.program") }}</p>
				<p class="text-base font-semibold text-foreground">
					{{ program.degree_program.name }}
				</p>
			</div>
			<Tabs v-model="selectedView" class="text-sm">
				<div class="space-y-2">
					<Select v-model="selectedView">
						<SelectTrigger class="w-full sm:hidden">
							<SelectValue :placeholder="t('chat.card.tabs.program')" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="program">{{ t("chat.card.tabs.program") }}</SelectItem>
							<SelectItem value="admission">{{ t("chat.card.tabs.admission") }}</SelectItem>
							<SelectItem value="career">{{ t("chat.card.tabs.career") }}</SelectItem>
						</SelectContent>
					</Select>
					<TabsList class="hidden h-auto w-full flex-wrap justify-start gap-1 p-1 sm:flex">
						<TabsTrigger value="program" class="text-sm">
							{{ t("chat.card.tabs.program") }}
						</TabsTrigger>
						<TabsTrigger value="admission" class="text-sm">
							{{ t("chat.card.tabs.admission") }}
						</TabsTrigger>
						<TabsTrigger value="career" class="text-sm">
							{{ t("chat.card.tabs.career") }}
						</TabsTrigger>
					</TabsList>
				</div>

				<div class="mt-4 grid">
					<TabsContent
						value="program"
						force-mount
						class="col-start-1 row-start-1 [&[hidden]]:block data-[state=inactive]:invisible data-[state=inactive]:pointer-events-none"
					>
					<p class="text-sm font-semibold text-foreground">{{ t("chat.card.programDetails") }}</p>
					<div class="mt-2 grid gap-2">
						<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<span class="text-muted-foreground">{{ t("chat.card.labels.degree") }}</span>
							<span class="break-words text-left font-semibold sm:text-right">
								{{ program.degree_program.degree_level }}
							</span>
						</div>
						<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<span class="text-muted-foreground">{{ t("chat.card.labels.field") }}</span>
							<span class="break-words text-left font-semibold sm:text-right">
								{{ program.degree_program.field }}
							</span>
						</div>
						<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<span class="text-muted-foreground">{{ t("chat.card.labels.track") }}</span>
							<span class="break-words text-left font-semibold sm:text-right">
								{{ program.degree_program.track_or_specialization ?? t("chat.card.notSpecified") }}
							</span>
						</div>
						<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<span class="text-muted-foreground">{{ t("chat.card.labels.type") }}</span>
							<span class="break-words text-left font-semibold sm:text-right">
								{{ program.degree_program.program_type }}
							</span>
						</div>
						<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<span class="text-muted-foreground">{{ t("chat.card.labels.duration") }}</span>
							<span class="break-words text-left font-semibold sm:text-right">
								{{ program.degree_program.duration ?? t("chat.card.notSpecified") }}
							</span>
						</div>
						<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<span class="text-muted-foreground">{{ t("chat.card.labels.language") }}</span>
							<span class="break-words text-left font-semibold sm:text-right">
								{{ program.degree_program.language ?? t("chat.card.notSpecified") }}
							</span>
						</div>
						<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<span class="text-muted-foreground">{{ t("chat.card.labels.faculty") }}</span>
							<span class="break-words text-left font-semibold sm:text-right">
								{{ program.faculty.name ?? t("chat.card.notSpecified") }}
							</span>
						</div>
					</div>
					</TabsContent>

					<TabsContent
						value="admission"
						force-mount
						class="col-start-1 row-start-1 [&[hidden]]:block data-[state=inactive]:invisible data-[state=inactive]:pointer-events-none"
					>
					<div>
						<p class="text-sm font-semibold text-foreground">{{ t("chat.card.admissions") }}</p>
						<div class="mt-2 grid gap-2">
							<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
								<span class="text-muted-foreground">{{ t("chat.card.labels.deadline") }}</span>
								<span class="break-words text-left font-semibold sm:text-right">
									{{ program.admissions.application_deadline ?? t("chat.card.notSpecified") }}
								</span>
							</div>
							<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
								<span class="text-muted-foreground">{{ t("chat.card.labels.languageReqs") }}</span>
								<span class="break-words text-left font-semibold sm:text-right">
									{{ formatLanguageRequirements() }}
								</span>
							</div>
							<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
								<span class="text-muted-foreground">{{ t("chat.card.labels.academicRequirements") }}</span>
								<span class="break-words text-left font-semibold sm:text-right">
									{{ program.admissions.academic_requirements ?? t("chat.card.notSpecified") }}
								</span>
							</div>
							<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
								<span class="text-muted-foreground">{{ t("chat.card.labels.otherRequirements") }}</span>
								<span class="break-words text-left font-semibold sm:text-right">
									{{ program.admissions.other_requirements ?? t("chat.card.notSpecified") }}
								</span>
							</div>
						</div>
					</div>

					<div class="mt-4">
						<p class="text-sm font-semibold text-foreground">{{ t("chat.card.tuition") }}</p>
						<div class="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<span class="text-muted-foreground">{{ t("chat.card.labels.cost") }}</span>
							<span class="break-words text-left font-semibold sm:text-right">
								{{ tuitionLabel() }}
							</span>
						</div>
					</div>
					</TabsContent>

					<TabsContent
						value="career"
						force-mount
						class="col-start-1 row-start-1 [&[hidden]]:block data-[state=inactive]:invisible data-[state=inactive]:pointer-events-none"
					>
					<div>
						<p class="text-sm font-semibold text-foreground">{{ t("chat.card.careerOutcomes") }}</p>
						<ul
							v-if="program.career_outcomes && program.career_outcomes.length"
							class="list-disc space-y-1 pt-2 pl-5"
						>
							<li
								v-for="(outcome, index) in program.career_outcomes"
								:key="index"
							>
								{{ outcome }}
							</li>
						</ul>
						<p v-else class="pt-2 text-muted-foreground">{{ t("chat.card.notSpecified") }}</p>
					</div>

					<div class="mt-4">
						<p class="text-sm font-semibold text-foreground">{{ t("chat.card.linksTitle") }}</p>
						<div class="mt-2 flex flex-wrap gap-2">
							<a
								:href="program.official_program_url"
								class="px-2 py-1 text-muted-foreground transition hover:text-primary hover:underline hover:underline-offset-2"
								target="_blank"
								rel="noopener noreferrer"
							>
								{{ t("chat.card.links.officialProgram") }}
							</a>
							<a
								:href="program.university.official_website"
								class="px-2 py-1 text-muted-foreground transition hover:text-primary hover:underline hover:underline-offset-2"
								target="_blank"
								rel="noopener noreferrer"
							>
								{{ t("chat.card.links.universitySite") }}
							</a>
							<a
								v-if="program.faculty.official_website"
								:href="program.faculty.official_website"
								class="px-2 py-1 text-muted-foreground transition hover:text-primary hover:underline hover:underline-offset-2"
								target="_blank"
								rel="noopener noreferrer"
							>
								{{ t("chat.card.links.facultySite") }}
							</a>
						</div>
					</div>
					</TabsContent>
				</div>
			</Tabs>
			<div class="mt-8 flex justify-end text-right">
				<div class="text-xs text-muted-foreground/70">
					<p>{{ t("chat.card.verified") }}</p>
					<p :title="program.last_verified || undefined">
						{{ formatVerifiedDate() }}
					</p>
				</div>
			</div>
		</CardContent>
	</Card>
</template>
