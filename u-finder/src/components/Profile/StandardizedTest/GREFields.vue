<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type GREntry = {
	test_date?: string
	scores?: {
		verbal?: string
		quantitative?: string
		analytical_writing?: string
		total?: string
	}
}

const props = defineProps<{
	entry: GREntry
	index: number
	editable: boolean
}>()

const { t } = useI18n()

if (!props.entry.scores) {
	props.entry.scores = { verbal: '', quantitative: '', analytical_writing: '', total: '' }
}
</script>

<template>
	<div class="grid gap-4">
		<Field>
			<FieldLabel :for="`gre-date-${props.index}`">{{ t('test.testDate') || 'Test date' }}</FieldLabel>
			<Input v-if="props.editable" :id="`gre-date-${props.index}`" type="date" v-model="props.entry.test_date" />
			<div v-else class="text-sm text-left">{{ props.entry.test_date || '-' }}</div>
		</Field>

		<div class="grid grid-cols-2 gap-4">
			<Field>
				<FieldLabel>{{ t('test.scores.verbal') || 'Verbal' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.verbal" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.verbal || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.quantitative') || 'Quantitative' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.quantitative" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.quantitative || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.analyticalWriting') || 'Analytical writing' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.analytical_writing" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.analytical_writing || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.total') || 'Total' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.total" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.total || '-' }}</div>
			</Field>
		</div>
	</div>
</template>
