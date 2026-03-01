<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type CAEEntry = {
	test_date?: string
	CEFR_level?: string
	scores?: {
		overall?: string
		reading_use_of_english?: string
		listening?: string
		writing?: string
		speaking?: string
	}
}

const props = defineProps<{
	entry: CAEEntry
	index: number
	editable: boolean
}>()

const { t } = useI18n()

if (!props.entry.scores) {
	props.entry.scores = { overall: '', reading_use_of_english: '', listening: '', writing: '', speaking: '' }
}
</script>

<template>
	<div class="grid gap-4">
		<Field>
			<FieldLabel :for="`cae-date-${props.index}`">{{ t('test.testDate') || 'Test date' }}</FieldLabel>
			<Input v-if="props.editable" :id="`cae-date-${props.index}`" type="date" v-model="props.entry.test_date" />
			<div v-else class="text-sm text-left">{{ props.entry.test_date || '-' }}</div>
		</Field>

		<Field>
			<FieldLabel :for="`cae-cefr-${props.index}`">{{ t('test.cefrLevel') || 'CEFR level' }}</FieldLabel>
			<Input v-if="props.editable" :id="`cae-cefr-${props.index}`" v-model="props.entry.CEFR_level" />
			<div v-else class="text-sm text-left">{{ props.entry.CEFR_level || '-' }}</div>
		</Field>

		<div class="grid grid-cols-2 gap-4">
			<Field>
				<FieldLabel>{{ t('test.scores.overall') || 'Overall' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.overall" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.overall || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.readingUseOfEnglish') || 'Reading & Use of English' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.reading_use_of_english" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.reading_use_of_english || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.listening') || 'Listening' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.listening" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.listening || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.writing') || 'Writing' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.writing" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.writing || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.speaking') || 'Speaking' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.speaking" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.speaking || '-' }}</div>
			</Field>
		</div>
	</div>
</template>
