<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type IBEntry = {
	exam_session?: string
	scores?: {
		total?: string
		core_points?: string
		extended_essay_grade?: string
		tok_grade?: string
	}
	subjects?: Array<{ subject: string; grade?: string }>
}

const props = defineProps<{
	entry: IBEntry
	index: number
	editable: boolean
}>()

const { t } = useI18n()

if (!props.entry.scores) {
	props.entry.scores = { total: '', core_points: '', extended_essay_grade: '', tok_grade: '' }
}

const subjects = computed(() => {
	if (!props.entry.subjects || props.entry.subjects.length === 0) {
		props.entry.subjects = [{ subject: '', grade: '' }]
	}
	return props.entry.subjects
})

function addSubject() {
	subjects.value.push({ subject: '', grade: '' })
}

function removeSubject(index: number) {
	if (subjects.value.length > 1) subjects.value.splice(index, 1)
}
</script>

<template>
	<div class="grid gap-4">
		<Field>
			<FieldLabel :for="`ib-session-${props.index}`">{{ t('test.examSession') || 'Exam session' }}</FieldLabel>
			<Input v-if="props.editable" :id="`ib-session-${props.index}`" v-model="props.entry.exam_session" />
			<div v-else class="text-sm text-left">{{ props.entry.exam_session || '-' }}</div>
		</Field>

		<div class="grid grid-cols-2 gap-4">
			<Field>
				<FieldLabel>{{ t('test.scores.total') || 'Total' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.total" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.total || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.corePoints') || 'Core points' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.core_points" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.core_points || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.extendedEssay') || 'Extended essay grade' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.extended_essay_grade" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.extended_essay_grade || '-' }}</div>
			</Field>
			<Field>
				<FieldLabel>{{ t('test.scores.tok') || 'TOK grade' }}</FieldLabel>
				<Input v-if="props.editable" v-model="props.entry.scores.tok_grade" />
				<div v-else class="text-sm text-left">{{ props.entry.scores.tok_grade || '-' }}</div>
			</Field>
		</div>

		<div class="grid gap-2">
			<div class="text-sm font-medium">{{ t('test.subjects') || 'Subjects' }}</div>
			<div v-for="(subject, sidx) in subjects" :key="sidx" class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel :for="`ib-subject-${props.index}-${sidx}`">{{ t('test.subject') || 'Subject' }}</FieldLabel>
					<Input
						v-if="props.editable"
						:id="`ib-subject-${props.index}-${sidx}`"
						v-model="subject.subject"
					/>
					<div v-else class="text-sm text-left">{{ subject.subject || '-' }}</div>
				</Field>
				<Field>
					<FieldLabel :for="`ib-grade-${props.index}-${sidx}`">{{ t('test.grade') || 'Grade' }}</FieldLabel>
					<Input
						v-if="props.editable"
						:id="`ib-grade-${props.index}-${sidx}`"
						v-model="subject.grade"
					/>
					<div v-else class="text-sm text-left">{{ subject.grade || '-' }}</div>
				</Field>
				<div v-if="props.editable" class="col-span-2 flex justify-end gap-2">
					<Button type="button" variant="secondary" @click="removeSubject(sidx)">Remove</Button>
					<Button type="button" @click="addSubject">Add</Button>
				</div>
			</div>
		</div>
	</div>
</template>
