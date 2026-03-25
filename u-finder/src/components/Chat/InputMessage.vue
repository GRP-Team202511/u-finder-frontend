<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
	Field,
	FieldContent,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, CircleStop } from "lucide-vue-next";

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

// Locate native <textarea> inside InputGroup for JS resize fallback
const wrapperRef = ref<HTMLElement | null>(null);
const getTextareaEl = () =>
	wrapperRef.value?.querySelector<HTMLTextAreaElement>("textarea") ?? null;

// JS fallback when `field-sizing: content` is unsupported (older Safari).
const autoResize = () => {
	if (CSS.supports("field-sizing", "content")) return;
	const el = getTextareaEl();
	if (!el) return;
	el.style.height = "auto";
	el.style.height = `${el.scrollHeight}px`;
};

const resetHeight = () => {
	if (CSS.supports("field-sizing", "content")) return;
	const el = getTextareaEl();
	if (el) el.style.height = "auto";
};

const submit = () => {
	if (props.isSending) return;
	const value = draft.value.trim();
	if (!value || props.disabled) return;
	emit("send", value);
	draft.value = "";
	nextTick(resetHeight);
};

const handleKeydown = (event: KeyboardEvent) => {
	if (event.key === "Enter" && event.shiftKey) return;

	if (event.key === "Enter") {
		if (event.isComposing || composing.value || event.keyCode === 229) return;
		// While the model streams, Enter is a no-op (no send, no newline).
		if (props.isSending) {
			event.preventDefault();
			return;
		}
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
					<!-- Native ref wrapper: component refs don't expose querySelector for textarea lookup -->
					<div ref="wrapperRef" class="w-full">
						<InputGroup
							class="w-full"
							:data-disabled="disabled ? 'true' : undefined"
						>
							<InputGroupTextarea
								v-model="draft"
								:placeholder="placeholder"
								:disabled="disabled"
								rows="1"
								enterkeyhint="send"
								class="min-h-12 max-h-[calc(6lh+1.5rem)] overflow-y-auto"
								@keydown="handleKeydown"
								@compositionstart="() => (composing = true)"
								@compositionend="() => (composing = false)"
								@input="autoResize"
							/>
							<InputGroupAddon
								align="block-end"
								class="flex flex-wrap items-center gap-2"
							>
								<InputGroupText
									class="text-xs [@media(hover:none)]:hidden"
								>
									{{ t("chat.input.newlineHint") }}
								</InputGroupText>
								<div class="ml-auto flex items-center gap-2">
									<Separator orientation="vertical" class="h-4!" />
									<InputGroupButton
										v-if="!isSending"
										type="submit"
										variant="default"
										size="icon-sm"
										class="rounded-full"
										:disabled="disabled || !draft.trim()"
									>
										<ArrowUp class="size-5" />
										<span class="sr-only">{{ t("chat.input.send") }}</span>
									</InputGroupButton>
									<InputGroupButton
										v-else
										type="button"
										variant="default"
										size="icon-sm"
										class="rounded-full"
										:disabled="stopDisabled"
										:aria-label="t('chat.input.stop')"
										@click="stop"
									>
										<CircleStop class="size-5" />
									</InputGroupButton>
								</div>
							</InputGroupAddon>
						</InputGroup>
					</div>
				</FieldContent>
			</Field>
		</FieldGroup>
	</form>
</template>
