<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";
import CompactUniversityCard from "@/components/Favourite/CompactUniversityCard.vue";
import UniversityDetailDialog from "@/components/Favourite/UniversityDetailDialog.vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useFavouriteStore } from "@/stores/favouriteStore";
import { useUserStore } from "@/stores/userStore";
import type { ProgramCardData } from "@/types/chat";

const favouriteStore = useFavouriteStore();
const userStore = useUserStore();
const router = useRouter();
const { t, locale } = useI18n();
const token = computed(() => userStore.user?.token || "");

const isLoading = ref(false);
const loadError = ref(false);

const selectedProgram = ref<ProgramCardData | null>(null);
const dialogOpen = computed(() => selectedProgram.value !== null);

const openDetails = (program: ProgramCardData) => {
	selectedProgram.value = program;
};

const closeDetails = () => {
	selectedProgram.value = null;
};

// --- Compare mode ---

/** Maximum number of programs that can be selected for comparison */
const MAX_COMPARE = 5;

/** Whether the page is in multi-select / compare mode */
const isCompareMode = ref(false);

/** Set of program keys that are currently selected for comparison */
const selectedKeys = ref<Set<string>>(new Set());

/** Derive a stable deduplication key for a program (mirrors favouriteStore.programKey) */
const programKey = (program: ProgramCardData): string =>
	program.official_program_url || `${program.university.name}-${program.degree_program.name}`;

/** Programmes currently selected (derived from store + selectedKeys) */
const selectedPrograms = computed(() =>
	favouriteStore.programs.filter((p) => selectedKeys.value.has(programKey(p)))
);

/** Enter or exit compare mode */
const toggleCompareMode = () => {
	isCompareMode.value = !isCompareMode.value;
	// Clear selections when exiting compare mode
	if (!isCompareMode.value) selectedKeys.value = new Set();
};

/** Toggle selection state of a single program card */
const handleToggleSelect = (program: ProgramCardData) => {
	const key = programKey(program);
	const next = new Set(selectedKeys.value);
	if (next.has(key)) {
		next.delete(key);
	} else {
		if (next.size >= MAX_COMPARE) {
			toast.warning(t("favourites.compare.maxReached", { max: MAX_COMPARE }));
			return;
		}
		next.add(key);
	}
	selectedKeys.value = next;
};

/** Build a structured comparison prompt and navigate to AI Chat */
const startComparison = () => {
	if (selectedPrograms.value.length < 2) return;

	const lines: string[] = [
		t("favourites.compare.promptIntro"),
		"",
	];

	selectedPrograms.value.forEach((p, index) => {
		// Format tuition label
		const { amount, currency, per } = p.tuition;
		const tuitionText =
			amount !== null && currency
				? `${currency} ${new Intl.NumberFormat(locale.value).format(amount)}${per ? ` / ${per}` : ""}`
				: t("chat.card.tuitionNotSpecified");

		const location = [p.university.city, p.university.country].filter(Boolean).join(", ") ||
			t("chat.card.locationNotSpecified");

		lines.push(`${index + 1}. ${p.university.name} — ${p.degree_program.name}`);
		lines.push(`   - ${t("favourites.compare.degreeLevel")}: ${p.degree_program.degree_level}`);
		lines.push(`   - ${t("favourites.compare.field")}: ${p.degree_program.field}`);
		lines.push(`   - ${t("favourites.compare.location")}: ${location}`);
		lines.push(`   - ${t("favourites.compare.tuition")}: ${tuitionText}`);
		if (p.admissions.academic_requirements) {
			lines.push(`   - ${t("favourites.compare.admissionReq")}: ${p.admissions.academic_requirements}`);
		}
		lines.push("");
	});

	lines.push(t("favourites.compare.promptOutro"));

	const prompt = lines.join("\n");

	// Store prompt in sessionStorage so AIChat picks it up on mount
	sessionStorage.setItem("pendingComparisonPrompt", prompt);
	// Clear current conversation so a fresh one is started
	sessionStorage.removeItem("currentConversationId");

	void router.push({ name: "AIChat" });
};

const loadFavourites = async () => {
	if (!token.value) {
		isLoading.value = false;
		loadError.value = false;
		return;
	}

	isLoading.value = true;
	loadError.value = false;

	try {
		await favouriteStore.fetchAll();
		loadError.value = false;
	} catch (error) {
		loadError.value = true;
		toast.error(t("favourites.toast.loadFailed"));
		console.error("Failed to load favourites", error);
	} finally {
		isLoading.value = false;
	}
};

const handleRemove = async (program: ProgramCardData) => {
	try {
		await favouriteStore.remove(program);
		toast.success(t("favourites.toast.removeSuccess"));
	} catch (error) {
		toast.error(t("favourites.toast.removeFailed"));
		console.error("Failed to remove favourite", error);
	}
};

watch(
	() => token.value,
	async () => {
		await loadFavourites();
	},
	{ immediate: true }
);
</script>

<template>
	<!-- Root fills the router-view slot (flex-1). Scrolling is handled by the
	     parent SidebarLayout container so the scrollbar stays flush with the
	     screen edge. The action bar uses sticky to stay at the bottom. -->
	<div class="flex min-h-0 flex-1 flex-col">
		<section class="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 py-4 sm:gap-6 sm:py-6">
			<header class="flex items-start justify-between gap-4 pt-6">
				<div class="space-y-1">
					<h1 class="text-2xl font-bold sm:text-3xl">{{ t("favourites.title") }}</h1>
					<p class="text-sm text-muted-foreground">
						<template v-if="isCompareMode">{{ t("favourites.compare.headerHint") }}</template>
						<template v-else>{{ t("favourites.subtitle") }}</template>
					</p>
				</div>
				<!-- Show compare toggle button only when there are programmes to compare -->
				<Button
					v-if="favouriteStore.programs.length >= 2"
					size="sm"
					:variant="isCompareMode ? 'destructive' : 'outline'"
					@click="toggleCompareMode"
				>
					{{ isCompareMode ? t("favourites.compare.cancelCompare") : t("favourites.compare.startCompare") }}
				</Button>
			</header>

			<div v-if="isLoading" class="flex flex-1 items-center justify-center">
				<Spinner class="h-8 w-8" />
			</div>

			<div v-else-if="loadError" class="flex flex-1 flex-col items-center justify-center py-12">
				<Card class="w-full max-w-2xl">
					<CardHeader>
						<CardTitle class="text-center text-destructive text-xl">
							{{ t("favourites.errors.loadFailed") }}
						</CardTitle>
					</CardHeader>
					<CardContent class="text-center text-muted-foreground">
						<p class="mb-4">{{ t("favourites.errors.loadFailedDescription") }}</p>
						<button
							class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
							@click="loadFavourites"
						>
							{{ t("favourites.actions.retry") }}
						</button>
					</CardContent>
				</Card>
			</div>

			<div
				v-else-if="!favouriteStore.programs.length"
				class="flex min-h-[60vh] flex-1 items-center justify-center"
			>
				<div class="max-w-md px-4 text-center text-muted-foreground">
					<p class="text-base font-semibold text-foreground">{{ t("favourites.empty.title") }}</p>
					<p class="mt-2 text-sm">{{ t("favourites.empty.description") }}</p>
				</div>
			</div>

			<div v-else class="grid gap-4 lg:grid-cols-2">
				<CompactUniversityCard
					v-for="program in favouriteStore.programs"
					:key="program.official_program_url || `${program.university.name}-${program.degree_program.name}`"
					:program="program"
					:selectable="isCompareMode"
					:selected="selectedKeys.has(programKey(program))"
					@show-details="openDetails"
					@remove="handleRemove"
					@toggle-select="handleToggleSelect"
				/>
			</div>

			<UniversityDetailDialog :open="dialogOpen" :program="selectedProgram" @close="closeDetails" />
		</section>

		<!-- Sticky action bar: lives outside the max-w section so it stretches
		     full-width. Negative margins cancel the parent container padding
		     from SidebarLayout (px-3 sm:px-4 lg:px-8). -->
		<Transition name="slide-up">
			<div
				v-if="isCompareMode"
				class="sticky bottom-0 z-40 -mx-3 flex shrink-0 items-center justify-between gap-4 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:-mx-4 sm:px-6 lg:-mx-8"
			>
				<p class="text-sm text-muted-foreground">
					<span class="font-semibold text-foreground">{{ selectedPrograms.length }}</span>
					{{ t("favourites.compare.selectedCount", { max: MAX_COMPARE }) }}
				</p>
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" @click="toggleCompareMode">
						{{ t("favourites.compare.cancelCompare") }}
					</Button>
					<Button
						size="sm"
						:disabled="selectedPrograms.length < 2"
						@click="startComparison"
					>
						{{ t("favourites.compare.compareNow") }}
					</Button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
	transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
	transform: translateY(100%);
	opacity: 0;
}
</style>
