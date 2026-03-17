import { defineStore } from "pinia";
import type { ProgramCardData } from "@/types/chat";
import {
	addFavouriteUniversity,
	checkFavouriteUniversity,
	deleteFavouriteUniversity,
	getFavouriteUniversities,
	type FavouriteItem,
} from "@/api/favouriteApi";

export const programKey = (program: ProgramCardData | null | undefined) => {
	if (!program) return "";
	const url =
		typeof program.official_program_url === "string"
			? program.official_program_url
			: "";
	const universityName =
		typeof program.university?.name === "string" ? program.university.name : "";
	const programName =
		typeof program.degree_program?.name === "string"
			? program.degree_program.name
			: "";
	return url || (universityName && programName ? `${universityName}-${programName}` : "");
};

let storageSyncBound = false;

type StoredItem = FavouriteItem;

export const extractProgram = (item: StoredItem): ProgramCardData => item.program;

const isFavouriteItem = (item: unknown): item is FavouriteItem => {
	if (!item || typeof item !== "object") return false;
	const candidate = item as FavouriteItem;
	return Boolean(candidate.unit_id && candidate.program);
};

const extractUnitId = (payload: unknown) => {
	if (!payload || typeof payload !== "object") return null;
	const direct = (payload as { unit_id?: string }).unit_id;
	if (typeof direct === "string") return direct;
	const nested = (payload as { data?: { unit_id?: string } }).data?.unit_id;
	return typeof nested === "string" ? nested : null;
};

export const useFavouriteStore = defineStore("favourite", {
	state: () => ({
		items: [] as StoredItem[],
	}),

	getters: {
		count: (state) => state.items.length,
		programs: (state) =>
			state.items.map((item) => extractProgram(item)),
	},

	actions: {
		startStorageSync() {
			if (storageSyncBound || typeof window === "undefined") return;
			storageSyncBound = true;
			window.addEventListener("storage", (event) => {
				if (event.key !== this.$id || !event.newValue) return;
				try {
					const parsed = JSON.parse(event.newValue) as {
						items?: StoredItem[];
					};
					if (Array.isArray(parsed.items)) {
						this.items = parsed.items.filter((item) => isFavouriteItem(item));
					}
				} catch {
					// Ignore malformed persisted data.
				}
			});
		},
		async fetchAll() {
			const response = await getFavouriteUniversities();
			this.items = response.data?.data ?? [];
		},
		isFavourite(program: ProgramCardData) {
			const key = programKey(program);
			return this.items.some((item) => programKey(extractProgram(item)) === key);
		},
		findItem(program: ProgramCardData) {
			const key = programKey(program);
			return (
				this.items.find((item) => programKey(extractProgram(item)) === key) ?? null
			);
		},
		async resolveUnitId(program: ProgramCardData) {
			const existing = this.findItem(program) as FavouriteItem | null;
			if (existing?.unit_id) return existing.unit_id;
			const response = await checkFavouriteUniversity(program);
			return extractUnitId(response.data);
		},
		async add(program: ProgramCardData) {
			if (this.isFavourite(program)) return;
			const unitId = await this.resolveUnitId(program);
			if (!unitId) return;
			await addFavouriteUniversity(unitId);
			await this.fetchAll();
		},
		async remove(program: ProgramCardData) {
			const key = programKey(program);
			const existing = this.findItem(program) as FavouriteItem | null;
			if (!existing?.unit_id) return;
			await deleteFavouriteUniversity(existing.unit_id);
			await this.fetchAll();
		},

	},

	persist: true,
});
