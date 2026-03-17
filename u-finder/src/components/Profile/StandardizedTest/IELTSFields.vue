<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import TestDateField from "./TestDateField.vue"

type IELTSEntry = {
	test_date?: string
	scores?: {
		overall?: string
		listening?: string
		reading?: string
		writing?: string
		speaking?: string
	}
}

const props = defineProps<{
	entry: IELTSEntry
	index: number
	editable: boolean
}>()

const { t } = useI18n()

if (!props.entry.scores) {
	props.entry.scores = { overall: '', listening: '', reading: '', writing: '', speaking: '' }
}
</script>

<template>
	<div class="grid gap-4">
		<TestDateField
			v-model="props.entry.test_date"
			:index="props.index"
			:editable="props.editable"
			id-base="ielts-date"
			:label="t('test.testDate')"
		/>

		<div class="rounded-md border p-4">
			<div class="grid gap-2">
			<div class="text-sm font-medium text-left">{{ t('test.scores.title') }}</div>
			<div class="grid grid-cols-2 gap-4 pt-2">
				<Field>
					<FieldLabel>{{ t('test.scores.overall') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.overall" placeholder="" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.overall || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.listening') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.listening" placeholder="" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.listening || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.reading') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.reading" placeholder="" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.reading || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.writing') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.writing" placeholder="" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.writing || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel>{{ t('test.scores.speaking') }}</FieldLabel>
					<Input v-if="props.editable" v-model="props.entry.scores.speaking" placeholder="" />
					<div v-else class="text-sm text-left">{{ props.entry.scores.speaking || '-' }}</div>
				</Field>
			</div>
			</div>
		</div>
	</div>
</template>
