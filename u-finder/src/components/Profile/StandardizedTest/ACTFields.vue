<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

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
		<Field>
			<FieldLabel :for="`act-date-${props.index}`">{{ t('test.testDate') || 'Test date' }}</FieldLabel>
			<Input v-if="props.editable" :id="`act-date-${props.index}`" type="date" v-model="props.entry.test_date" />
			<div v-else class="text-sm text-left">{{ props.entry.test_date || '-' }}</div>
		</Field>

		<div class="grid grid-cols-2 gap-4">
			<Field>
				<FieldLabel>{{ t('test.scores.composite') || 'Composite' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.composite" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.composite || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.english') || 'English' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.english" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.english || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.math') || 'Math' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.math" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.math || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.reading') || 'Reading' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.reading" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.reading || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.science') || 'Science' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.science" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.science || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.writingOptional') || 'Writing (optional)' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.writing_optional" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.writing_optional || '-' }}</div>
			</Field>
		</div>
	</div>
</template>
