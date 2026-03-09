<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import CompactUniversityCard from "@/components/Favourite/CompactUniversityCard.vue";
import UniversityDetailDialog from "@/components/Favourite/UniversityDetailDialog.vue";
import { useFavouriteStore } from "@/stores/favouriteStore";
import { useUserStore } from "@/stores/userStore";
import type { ProgramCardData } from "@/types/chat";

const favouriteStore = useFavouriteStore();
const userStore = useUserStore();
const { t } = useI18n();

const useMockFavourites = import.meta.env.VITE_USE_MOCK_FAVOURITES === "true";

const selectedProgram = ref<ProgramCardData | null>(null);
const dialogOpen = computed(() => selectedProgram.value !== null);

const openDetails = (program: ProgramCardData) => {
	selectedProgram.value = program;
};

const closeDetails = () => {
	selectedProgram.value = null;
};

watch(
	() => userStore.user?.id,
	async (userId) => {
		if (useMockFavourites || !userId) return;
		await favouriteStore.fetchAll(String(userId));
	},
	{ immediate: true }
);
</script>

<template>
	<section class="relative flex min-h-0 flex-1 flex-col gap-6">
		<header class="space-y-1 pt-6">
			<h1 class="text-2xl font-semibold">{{ t("favourites.title") }}</h1>
			<p class="text-sm text-muted-foreground">{{ t("favourites.subtitle") }}</p>
		</header>

		<div v-if="!favouriteStore.programs.length" class="absolute inset-0 flex items-center justify-center">
			<div class="max-w text-center text-muted-foreground">
				<p class="text-base font-semibold text-foreground">{{ t("favourites.empty.title") }}</p>
				<p class="mt-2 text-sm">{{ t("favourites.empty.description") }}</p>
			</div>
		</div>

		<div v-else class="grid gap-4 lg:grid-cols-2">
			<CompactUniversityCard
				v-for="program in favouriteStore.programs"
				:key="program.official_program_url || `${program.university.name}-${program.degree_program.name}`"
				:program="program"
				@show-details="openDetails"
				@remove="favouriteStore.remove"
			/>
		</div>

		<UniversityDetailDialog :open="dialogOpen" :program="selectedProgram" @close="closeDetails" />
	</section>
</template>
