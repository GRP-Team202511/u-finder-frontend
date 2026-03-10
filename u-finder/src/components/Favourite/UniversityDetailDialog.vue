<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "@/components/ui/button";
import UniversityCard from "@/components/Chat/UniversityCard.vue";
import type { ProgramCardData } from "@/types/chat";

const props = defineProps<{
	open: boolean;
	program: ProgramCardData | null;
}>();

const emit = defineEmits<{ (e: "close"): void }>();
const { t } = useI18n();

const handleEscape = (event: KeyboardEvent) => {
	if (event.key === "Escape") {
		emit("close");
	}
};

watch(
	() => props.open,
	(isOpen) => {
		if (!isOpen) return;
		requestAnimationFrame(() => {
			const firstFocusable = document.querySelector<HTMLElement>("[data-dialog-focus]");
			firstFocusable?.focus();
		});
	}
);

onMounted(() => {
	window.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
	window.removeEventListener("keydown", handleEscape);
});
</script>

<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div
					class="absolute inset-0 bg-black/50 backdrop-blur-sm"
					@click.self="emit('close')"
				/>
				<div class="relative flex w-full max-w-4xl flex-col gap-4">
					<div class="max-h-[80vh] overflow-y-auto">
						<UniversityCard v-if="program" :program="program" />
					</div>
					<div class="flex justify-end">
						<Button data-dialog-focus variant="outline" @click="emit('close')">
							{{ t("favourites.actions.close") }}
						</Button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

