<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type SATEntry = {
	test_date?: string
	scores?: {
		total?: string
		evidence_based_reading_and_writing?: string
		math?: string
		essay_optional?: string
	}
}

const props = defineProps<{
	entry: SATEntry
	index: number
	editable: boolean
}>()

const { t } = useI18n()

if (!props.entry.scores) {
	props.entry.scores = { total: '', evidence_based_reading_and_writing: '', math: '', essay_optional: '' }
}
</script>

<template>
	<div class="grid gap-4">
		<Field>
			<FieldLabel :for="`sat-date-${props.index}`">{{ t('test.testDate') || 'Test date' }}</FieldLabel>
			<Input v-if="props.editable" :id="`sat-date-${props.index}`" type="date" v-model="props.entry.test_date" />
			<div v-else class="text-sm text-left">{{ props.entry.test_date || '-' }}</div>
		</Field>

		<div class="grid grid-cols-2 gap-4">
			<Field>
				<FieldLabel>{{ t('test.scores.total') || 'Total' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.total" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.total || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.ebrw') || 'Evidence-based reading and writing' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.evidence_based_reading_and_writing" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.evidence_based_reading_and_writing || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.math') || 'Math' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.math" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.math || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.essayOptional') || 'Essay (optional)' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.essay_optional" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.essay_optional || '-' }}</div>
			</Field>
		</div>
	</div>
</template>
