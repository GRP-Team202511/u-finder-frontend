<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldContent,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SendHorizontal } from 'lucide-vue-next';


const props = defineProps<{ placeholder?: string; disabled?: boolean }>();
const emit = defineEmits<{ (event: "send", value: string): void }>();

const draft = ref("");

const submit = () => {
	const value = draft.value.trim();
	if (!value || props.disabled) return;
	emit("send", value);
	draft.value = "";
};

const handleKeydown = (event: KeyboardEvent) => {
	if (event.key === "Enter" && !event.shiftKey) {
		event.preventDefault();
		submit();
	}
};
</script>

<template>
	<form class="flex w-full flex-col gap-2" @submit.prevent="submit">
		<FieldGroup class="w-full">
			<Field class="gap-2">
				<FieldLabel class="sr-only">Message</FieldLabel>
				<FieldContent>
					<div class="flex w-full items-center gap-3">
						<Input
							v-model="draft"
							:placeholder="placeholder"
							:disabled="disabled"
							class="flex-1 h-12 text-lg placeholder:text-lg"
							@keydown="handleKeydown"
						/>
						<Button
							variant="ghost"
							size="icon"
							type="submit"
							:disabled="disabled || !draft.trim()"
							class="h-12 w-12"
						>
							<SendHorizontal class="size-5" />
						</Button>
					</div>
				</FieldContent>
			</Field>
		</FieldGroup>
	</form>
</template>


