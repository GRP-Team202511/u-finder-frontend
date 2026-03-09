import { defineStore } from "pinia";
import type { ProgramCardData } from "@/types/chat";

const programKey = (program: ProgramCardData) =>
	program.official_program_url || `${program.university.name}-${program.degree_program.name}`;

export const useFavouriteStore = defineStore("favourite", {
	state: () => ({
		items: [] as ProgramCardData[],
	}),

	getters: {
		count: (state) => state.items.length,
	},

	actions: {
		isFavourite(program: ProgramCardData) {
			const key = programKey(program);
			return this.items.some((item) => programKey(item) === key);
		},
		add(program: ProgramCardData) {
			if (this.isFavourite(program)) return;
			this.items.unshift(program);
		},
		remove(program: ProgramCardData) {
			const key = programKey(program);
			this.items = this.items.filter((item) => programKey(item) !== key);
		},
		toggle(program: ProgramCardData) {
			if (this.isFavourite(program)) {
				this.remove(program);
				return;
			}
			this.add(program);
		},
	},

	persist: true,
});
