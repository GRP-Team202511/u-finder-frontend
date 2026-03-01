<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type APEntry = {
	exam_year?: string
	subjects?: Array<{ subject: string; score?: string }>
}

const props = defineProps<{
	entry: APEntry
	index: number
	editable: boolean
}>()

const { t } = useI18n()

const subjects = computed(() => {
	if (!props.entry.subjects || props.entry.subjects.length === 0) {
		props.entry.subjects = [{ subject: '', score: '' }]
	}
	return props.entry.subjects
})

function addSubject() {
	subjects.value.push({ subject: '', score: '' })
}

function removeSubject(index: number) {
	if (subjects.value.length > 1) subjects.value.splice(index, 1)
}
</script>

<template>
	<div class="grid gap-4">
		<Field>
			<FieldLabel :for="`ap-year-${props.index}`">{{ t('test.examYear') || 'Exam year' }}</FieldLabel>
			<Input v-if="props.editable" :id="`ap-year-${props.index}`" v-model="props.entry.exam_year" />
			<div v-else class="text-sm text-left">{{ props.entry.exam_year || '-' }}</div>
		</Field>

		<div class="grid gap-2">
			<div class="text-sm font-medium">{{ t('test.subjects') || 'Subjects' }}</div>
			<div v-for="(subject, sidx) in subjects" :key="sidx" class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel :for="`ap-subject-${props.index}-${sidx}`">{{ t('test.subject') || 'Subject' }}</FieldLabel>
					<Input
						v-if="props.editable"
						:id="`ap-subject-${props.index}-${sidx}`"
						v-model="subject.subject"
					/>
					<div v-else class="text-sm text-left">{{ subject.subject || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel :for="`ap-score-${props.index}-${sidx}`">{{ t('test.score') || 'Score' }}</FieldLabel>
					<Input
						v-if="props.editable"
						:id="`ap-score-${props.index}-${sidx}`"
						v-model="subject.score"
					/>
					<div v-else class="text-sm text-left">{{ subject.score || '-' }}</div>
				</Field>
				<div v-if="props.editable" class="col-span-2 flex justify-end gap-2">
					<Button type="button" variant="secondary" @click="removeSubject(sidx)">Remove</Button>
					<Button type="button" @click="addSubject">Add</Button>
				</div>
			</div>
		</div>
	</div>
</template>
