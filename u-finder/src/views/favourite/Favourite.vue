<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";
import CompactUniversityCard from "@/components/Favourite/CompactUniversityCard.vue";
import UniversityDetailDialog from "@/components/Favourite/UniversityDetailDialog.vue";
import { Spinner } from "@/components/ui/spinner";
import { useFavouriteStore } from "@/stores/favouriteStore";
import { useUserStore } from "@/stores/userStore";
import type { ProgramCardData } from "@/types/chat";

const favouriteStore = useFavouriteStore();
const userStore = useUserStore();
const { t } = useI18n();
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
	<section class="relative flex min-h-0 flex-1 flex-col gap-4 py-4 sm:gap-6 sm:py-6">
		<header class="space-y-1 pt-6">
			<h1 class="text-2xl font-semibold">{{ t("favourites.title") }}</h1>
			<p class="text-sm text-muted-foreground">{{ t("favourites.subtitle") }}</p>
		</header>

		<div v-if="isLoading" class="flex flex-1 items-center justify-center">
			<Spinner class="h-8 w-8" />
		</div>

		<div v-else-if="loadError" class="flex flex-1 flex-col items-center justify-center gap-4">
			<p class="text-sm text-muted-foreground">{{ t("favourites.errors.loadFailed") }}</p>
			<button
				class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
				@click="loadFavourites"
			>
				{{ t("favourites.actions.retry") }}
			</button>
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
				@show-details="openDetails"
				@remove="handleRemove"
			/>
		</div>

		<UniversityDetailDialog :open="dialogOpen" :program="selectedProgram" @close="closeDetails" />
	</section>
</template>
