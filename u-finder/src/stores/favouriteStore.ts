import { defineStore } from "pinia";
import type { ProgramCardData } from "@/types/chat";
import {
	addFavouriteUniversity,
	checkFavouriteUniversity,
	deleteFavouriteUniversity,
	getFavouriteUniversities,
	type FavouriteItem,
} from "@/api/favouriteApi";

export const programKey = (program: ProgramCardData) =>
	program.official_program_url || `${program.university.name}-${program.degree_program.name}`;

const useMockFavourites = import.meta.env.VITE_USE_MOCK_FAVOURITES === "true";

let storageSyncBound = false;

type StoredItem = ProgramCardData | FavouriteItem;

export const extractProgram = (item: StoredItem): ProgramCardData =>
	(item as FavouriteItem).program ?? (item as ProgramCardData);

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
		lastUserId: null as string | null,
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
						lastUserId?: string | null;
					};
					if (Array.isArray(parsed.items)) {
						this.items = parsed.items;
					}
					if (parsed.lastUserId !== undefined) {
						this.lastUserId = parsed.lastUserId ?? null;
					}
				} catch {
					// Ignore malformed persisted data.
				}
			});
		},
		async fetchAll(userId: string) {
			this.lastUserId = userId;
			if (useMockFavourites) return;
			const response = await getFavouriteUniversities(userId);
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
			if (useMockFavourites) {
				this.items.unshift(program);
				return;
			}
			const unitId = await this.resolveUnitId(program);
			if (!unitId) return;
			await addFavouriteUniversity(unitId);
			if (this.lastUserId) {
				await this.fetchAll(this.lastUserId);
			}
		},
		async remove(program: ProgramCardData) {
			const key = programKey(program);
			if (useMockFavourites) {
				this.items = this.items.filter((item) => programKey(extractProgram(item)) !== key);
				return;
			}
			const existing = this.findItem(program) as FavouriteItem | null;
			if (!existing?.unit_id) return;
			await deleteFavouriteUniversity(existing.unit_id);
			if (this.lastUserId) {
				await this.fetchAll(this.lastUserId);
			}
		},

	},

	persist: true,
});
