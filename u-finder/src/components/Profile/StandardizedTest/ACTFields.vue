<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import TestDateField from "./TestDateField.vue"

type ACTEntry = {
	test_date?: string
	scores?: {
		composite?: string
		english?: string
		math?: string
		reading?: string
		science?: string
		writing_optional?: string
	}
}

const props = defineProps<{
	entry: ACTEntry
	index: number
	editable: boolean
}>()

const { t } = useI18n()

if (!props.entry.scores) {
	props.entry.scores = { composite: '', english: '', math: '', reading: '', science: '', writing_optional: '' }
}
</script>

<template>
	<div class="grid gap-4">
		<TestDateField
			v-model="props.entry.test_date"
			:index="props.index"
			:editable="props.editable"
			id-base="act-date"
			:label="t('test.testDate')"
		/>

		<div class="rounded-md border p-4">
			<div class="grid gap-2">
			<div class="text-sm font-medium text-left">{{ t('test.scores.title') }}</div>
			<div class="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
				<Field>
					<FieldLabel>{{ t('test.scores.composite') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.composite" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.composite || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.english') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.english" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.english || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.math') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.math" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.math || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.reading') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.reading" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.reading || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.science') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.science" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.science || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.writingOptional') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.writing_optional" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.writing_optional || '-' }}</div>
				</Field>
			</div>
			</div>
		</div>
	</div>
</template>
