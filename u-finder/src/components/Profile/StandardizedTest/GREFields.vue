<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import TestDateField from "./TestDateField.vue"

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
		<TestDateField
			v-model="props.entry.test_date"
			:index="props.index"
			:editable="props.editable"
			id-base="gre-date"
			:label="t('test.testDate')"
		/>

		<div class="rounded-md border p-4">
			<div class="grid gap-2">
			<div class="text-sm font-medium text-left">{{ t('test.scores.title') }}</div>
			<div class="grid grid-cols-2 gap-4 pt-2">
				<Field>
					<FieldLabel>{{ t('test.scores.verbal') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.verbal" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.verbal || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.quantitative') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.quantitative" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.quantitative || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.analyticalWriting') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.analytical_writing" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.analytical_writing || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.total') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.total" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.total || '-' }}</div>
				</Field>
			</div>
			</div>
		</div>
	</div>
</template>
