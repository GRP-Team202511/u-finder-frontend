<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import TestDateField from "./TestDateField.vue"

type DuolingoEntry = {
	test_date?: string
	scores?: {
		overall?: string
		literacy?: string
		comprehension?: string
		conversation?: string
		production?: string
	}
}

const props = defineProps<{
	entry: DuolingoEntry
	index: number
	editable: boolean
}>()

const { t } = useI18n()

if (!props.entry.scores) {
	props.entry.scores = { overall: '', literacy: '', comprehension: '', conversation: '', production: '' }
}
</script>

<template>
	<div class="grid gap-4">
		<TestDateField
			v-model="props.entry.test_date"
			:index="props.index"
			:editable="props.editable"
			id-base="duolingo-date"
			:label="t('test.testDate') || 'Test date'"
		/>

		<div class="grid grid-cols-2 gap-4">
			<Field>
				<FieldLabel>{{ t('test.scores.overall') || 'Overall' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.overall" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.overall || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.literacy') || 'Literacy' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.literacy" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.literacy || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.comprehension') || 'Comprehension' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.comprehension" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.comprehension || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.conversation') || 'Conversation' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.conversation" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.conversation || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.production') || 'Production' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.production" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.production || '-' }}</div>
			</Field>
		</div>
	</div>
</template>
