<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import TestDateField from "./TestDateField.vue"

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
		<TestDateField
			v-model="props.entry.test_date"
			:index="props.index"
			:editable="props.editable"
			id-base="sat-date"
			:label="t('test.testDate')"
		/>

		<div class="rounded-md border p-4">
			<div class="grid gap-2">
			<div class="text-sm font-medium text-left">{{ t('test.scores.title') }}</div>
			<div class="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
				<Field>
					<FieldLabel>{{ t('test.scores.total') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.total" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.total || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.ebrw') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.evidence_based_reading_and_writing" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.evidence_based_reading_and_writing || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.math') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.math" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.math || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.essayOptional') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.essay_optional" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.essay_optional || '-' }}</div>
				</Field>
			</div>
			</div>
		</div>
	</div>
</template>
