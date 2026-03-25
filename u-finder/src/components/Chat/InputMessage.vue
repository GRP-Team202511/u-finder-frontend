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
const composing = ref(false);

const submit = () => {
	const value = draft.value.trim();
	if (!value || props.disabled) return;
	emit("send", value);
	draft.value = "";
};

const handleKeydown = (event: KeyboardEvent) => {
	// Shift+Enter: let the browser insert a newline naturally (no preventDefault)
	if (event.key === "Enter" && event.shiftKey) return;

	if (event.key === "Enter") {
		// Skip send during IME composition to avoid submitting mid-composition.
		// event.isComposing covers modern browsers; composing ref + keyCode 229
		// covers old Safari where isComposing is unreliable.
		if (event.isComposing || composing.value || event.keyCode === 229) return;

		// Prevent the default newline so Enter always means "send"
		event.preventDefault();
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
					@compositionstart="() => (composing = true)"
					@compositionend="() => (composing = false)"
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


