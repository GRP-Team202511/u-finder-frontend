<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

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

const { t, locale } = useI18n()

if (!props.entry.scores) {
	props.entry.scores = { total: '', core_points: '', extended_essay_grade: '', tok_grade: '' }
}

const subjects = computed(() => {
	if (!props.entry.subjects || props.entry.subjects.length === 0) {
		props.entry.subjects = [{ subject: '', grade: '' }]
	}
	return props.entry.subjects
})

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

const examYears = computed(() => {
	const years: number[] = []
	for (let y = currentYear; y >= currentYear - 30; y -= 1) years.push(y)
	return years
})

const monthLabels = computed(() => {
	const formatter = new Intl.DateTimeFormat(locale.value, { month: 'long' })
	return Array.from({ length: 12 }, (_, idx) => formatter.format(new Date(2020, idx, 1)))
})

const availableMonths = computed(() => {
	const year = Number(selectedYear.value)
	const max = year === currentYear ? currentMonth : 12
	const months: Array<{ value: string; label: string }> = []
	for (let m = 1; m <= max; m += 1) {
		months.push({ value: String(m).padStart(2, '0'), label: monthLabels.value[m - 1] || '' })
	}
	return months
})

const selectedYear = computed({
	get: () => (props.entry.exam_session ? props.entry.exam_session.split('-')[0] : ''),
	set: (val) => updateExamSession(val ?? '', selectedMonth.value ?? '')
})

const selectedMonth = computed({
	get: () => (props.entry.exam_session ? (props.entry.exam_session.split('-')[1] || '') : ''),
	set: (val) => updateExamSession(selectedYear.value ?? '', val ?? '')
})

function updateExamSession(year: string, month: string) {
	if (!year && !month) {
		props.entry.exam_session = ''
		return
	}
	if (year && month) {
		const y = Number(year)
		const mNum = Number(month)
		const max = y === currentYear ? currentMonth : 12
		const safeMonth = String(Math.min(Math.max(mNum || 1, 1), max)).padStart(2, '0')
		props.entry.exam_session = `${year}-${safeMonth}`
		return
	}
	props.entry.exam_session = year
}

function addSubject() {
	subjects.value.push({ subject: '', grade: '' })
}

function removeSubject(index: number) {
	subjects.value.splice(index, 1)
}
</script>

<template>
	<div class="grid gap-4">
		<Field>
			<FieldLabel :for="`ib-session-${props.index}`">{{ t('test.examSession') || 'Exam session' }}</FieldLabel>
			<div v-if="props.editable" class="grid grid-cols-2 gap-4">
				<Select v-model="selectedYear">
					<SelectTrigger :id="`ib-year-${props.index}`" class="w-full">
						<SelectValue :placeholder="t('test.examYear') || 'Year'" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem v-for="year in examYears" :key="year" :value="String(year)">{{ year }}</SelectItem>
					</SelectContent>
				</Select>
				<Select v-model="selectedMonth">
					<SelectTrigger :id="`ib-month-${props.index}`" class="w-full">
						<SelectValue :placeholder="t('test.month') || 'Month'" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem v-for="month in availableMonths" :key="month.value" :value="month.value">{{ month.label }}</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div v-else class="text-sm text-left">{{ props.entry.exam_session || '-' }}</div>
		</Field>

		<div class="rounded-md border p-4">
			<div class="grid gap-2">
			<div class="text-sm font-medium text-left">{{ t('test.scores.title') || 'Scores' }}</div>
			<div class="grid grid-cols-2 gap-4 pt-2">
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
			</div>
		</div>

		<div class="rounded-md border p-4">
			<div class="grid gap-2">
				<div class="text-sm font-medium text-left">{{ t('test.subjects') || 'Subjects' }}</div>
				<div v-for="(subject, sidx) in subjects" :key="sidx" class="grid grid-cols-2 gap-4 pt-2">
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
						<Button type="button" variant="secondary" @click="removeSubject(sidx)">{{ t('profile.remove') || 'Remove' }}</Button>
						<Button type="button" @click="addSubject">{{ t('profile.add') || 'Add' }}</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
