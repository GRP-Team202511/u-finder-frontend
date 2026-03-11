<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldContent,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CircleStop, SendHorizontal } from 'lucide-vue-next';


const props = defineProps<{
	placeholder?: string;
	disabled?: boolean;
	isSending?: boolean;
	stopDisabled?: boolean;
}>();
const emit = defineEmits<{
	(event: "send", value: string): void;
	(event: "stop"): void;
}>();
const { t } = useI18n();

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
		if (props.isSending) {
			emit("stop");
			return;
		}
		submit();
	}
};

const stop = () => {
	if (props.stopDisabled) return;
	emit("stop");
};
</script>

<template>
	<form class="flex w-full flex-col gap-2" @submit.prevent="submit">
		<FieldGroup class="w-full">
			<Field class="gap-2">
				<FieldLabel class="sr-only">{{ t("chat.input.label") }}</FieldLabel>
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
							v-if="!isSending"
							variant="ghost"
							size="icon"
							type="submit"
							:disabled="disabled || !draft.trim()"
							class="h-12 w-12"
						>
							<SendHorizontal class="size-5" />
						</Button>
						<Button
							v-else
							variant="ghost"
							size="icon"
							type="button"
							:disabled="stopDisabled"
							:aria-label="t('chat.input.stop')"
							class="h-12 w-12"
							@click="stop"
						>
							<CircleStop class="size-7" />
						</Button>
					</div>
				</FieldContent>
			</Field>
		</FieldGroup>
	</form>
</template>


