<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn, isBlankValue } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useI18n } from 'vue-i18n'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Field,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from 'vue-sonner'
import { ref, reactive, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import IELTSFields from "./IELTSFields.vue"
import TOEFLFields from "./TOEFLFields.vue"
import DuolingoFields from "./DuolingoFields.vue"
import GREFields from "./GREFields.vue"
import GMATFields from "./GMATFields.vue"
import SATFields from "./SATFields.vue"
import ACTFields from "./ACTFields.vue"
import ALevelFields from "./ALevelFields.vue"
import APFields from "./APFields.vue"
import IBFields from "./IBFields.vue"
import CAEFields from "./CAEFields.vue"

type StandardizedType =
	| ""
	| "IELTS"
	| "TOEFL iBT"
	| "Duolingo English Test"
	| "GRE"
	| "GMAT"
	| "SAT"
	| "ACT"
	| "A-Level"
	| "AP"
	| "IB Diploma"
	| "Cambridge English C1 Advanced (CAE)"

type StandardizedEntry = {
	type: StandardizedType
	test_date?: string
	registration_number?: string
	CEFR_level?: string
	exam_session?: string
	exam_year?: string
	overall_predicted?: string
	scores?: Record<string, string>
	subjects?: Array<{ subject: string; grade?: string; score?: string }>
}

const { t } = useI18n()

const props = defineProps<{
	class?: HTMLAttributes["class"]
	modelValue?: StandardizedEntry[]
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', payload: StandardizedEntry[]): void
	(e: 'save', payload: StandardizedEntry[]): void
	(e: 'cancel'): void
	(e: 'request-edit'): void
	(e: 'edit-complete'): void
}>()

// participate in global profile edit/save/cancel via optional provided API
type ProfileEditor = {
	register: (h: { save: () => void; cancel?: () => void }) => () => void
}
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)

// local edit state
const localEditing = ref(false)
const pendingSave = ref(false)

function createEntryForType(type: StandardizedType): StandardizedEntry {
	switch (type) {
		case "IELTS":
			return { type, test_date: '', scores: { overall: '', listening: '', reading: '', writing: '', speaking: '' } }
		case "TOEFL iBT":
			return { type, test_date: '', registration_number: '', scores: { overall: '', listening: '', reading: '', writing: '', speaking: '' } }
		case "Duolingo English Test":
			return { type, test_date: '', scores: { overall: '', literacy: '', comprehension: '', conversation: '', production: '' } }
		case "GRE":
			return { type, test_date: '', scores: { verbal: '', quantitative: '', analytical_writing: '', total: '' } }
		case "GMAT":
			return { type, test_date: '', scores: { total: '', quantitative: '', verbal: '', integrated_reasoning: '', analytical_writing: '' } }
		case "SAT":
			return { type, test_date: '', scores: { total: '', evidence_based_reading_and_writing: '', math: '', essay_optional: '' } }
		case "ACT":
			return { type, test_date: '', scores: { composite: '', english: '', math: '', reading: '', science: '', writing_optional: '' } }
		case "A-Level":
			return { type, exam_session: '', overall_predicted: '', subjects: [{ subject: '', grade: '' }] }
		case "AP":
			return { type, exam_year: '', subjects: [{ subject: '', score: '' }] }
		case "IB Diploma":
			return {
				type,
				exam_session: '',
				scores: { total: '', core_points: '', extended_essay_grade: '', tok_grade: '' },
				subjects: [{ subject: '', grade: '' }],
			}
		case "Cambridge English C1 Advanced (CAE)":
			return {
				type,
				test_date: '',
				CEFR_level: '',
				scores: { overall: '', reading_use_of_english: '', listening: '', writing: '', speaking: '' },
			}
		default:
			return { type: '' }
	}
}

const standardizedTests: Ref<StandardizedEntry[]> = ref(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [
	createEntryForType('')
])

// validation error tracking for each entry
const validationErrors = reactive<{
	type: boolean[]
}>(
	{
		type: standardizedTests.value.map(() => false)
	}
)

// Clear validation error for type field
function clearError(index: number, field: 'type') {
	validationErrors[field][index] = false
}

watch(
	() => props.modelValue,
	(nv) => {
		if (!localEditing.value && nv) {
			standardizedTests.value = JSON.parse(JSON.stringify(nv))
			// Reset validation errors
			validationErrors.type = standardizedTests.value.map(() => false)
		} else if (pendingSave.value && nv) {
			// Save succeeded: parent updated modelValue, exit edit mode
			localEditing.value = false
			pendingSave.value = false
			emit('edit-complete')
		}
	},
	{ deep: true }
)

function resetFieldsForType(index: number, nextType: StandardizedType) {
	const current = standardizedTests.value[index]
	if (current?.type === nextType) return
	standardizedTests.value[index] = createEntryForType(nextType)
}

function typeLabel(type: StandardizedType) {
	if (type === 'IELTS') return t('test.types.ielts')
	if (type === 'TOEFL iBT') return t('test.types.toeflIbt')
	if (type === 'Duolingo English Test') return t('test.types.duolingo')
	if (type === 'GRE') return t('test.types.gre')
	if (type === 'GMAT') return t('test.types.gmat')
	if (type === 'SAT') return t('test.types.sat')
	if (type === 'ACT') return t('test.types.act')
	if (type === 'A-Level') return t('test.types.aLevel')
	if (type === 'AP') return t('test.types.ap')
	if (type === 'IB Diploma') return t('test.types.ibDiploma')
	if (type === 'Cambridge English C1 Advanced (CAE)') return t('test.types.cae')
	return '-'
}

function addEntry() {
	standardizedTests.value.push(createEntryForType(''))
	validationErrors.type.push(false)
}

function removeEntry(index: number) {
	standardizedTests.value.splice(index, 1)
	if (validationErrors.type.length > index) validationErrors.type.splice(index, 1)
}

function save(e?: Event) {
	if (e && e.preventDefault) e.preventDefault()

	const hasNonEmptyScores = (scores?: Record<string, string>) =>
		!!scores && Object.values(scores).some(v => !isBlankValue(v))
	const hasNonEmptySubjects = (subjects?: Array<{ subject: string; grade?: string; score?: string }>) =>
		!!subjects && subjects.some(s => !isBlankValue(s.subject) || !isBlankValue(s.grade) || !isBlankValue(s.score))

	// Remove untouched blank entries so users don't need to manually click Remove.
	standardizedTests.value = standardizedTests.value.filter((test) => {
		if (!test) return false
		if (test.type) return true
		const hasAnyField =
			!isBlankValue(test.test_date) ||
			!isBlankValue(test.registration_number) ||
			!isBlankValue(test.CEFR_level) ||
			!isBlankValue(test.exam_session) ||
			!isBlankValue(test.exam_year) ||
			!isBlankValue(test.overall_predicted) ||
			hasNonEmptyScores(test.scores) ||
			hasNonEmptySubjects(test.subjects)
		return hasAnyField
	})
	
	// Clear all validation errors first
	validationErrors.type = standardizedTests.value.map(() => false)
	
	// Clean up empty subjects for tests that have subjects
	for (let i = 0; i < standardizedTests.value.length; i++) {
		const test = standardizedTests.value[i]
		if (!test) continue
		
		// Remove empty subjects for A-Level, AP, and IB Diploma
		if (test.type === 'A-Level' || test.type === 'AP' || test.type === 'IB Diploma') {
			if (test.subjects && test.subjects.length > 0) {
				test.subjects = test.subjects.filter(s => s.subject && s.subject.trim())
			}
		}
	}
	
	// Validate required fields
	let hasError = false
	for (let i = 0; i < standardizedTests.value.length; i++) {
		const test = standardizedTests.value[i]
		if (!test) continue
		
		if (!test.type) {
			validationErrors.type[i] = true
			hasError = true
			toast.error(t('test.validation.typeRequired', { index: i + 1 }))
			continue
		}
		
		// Validate subjects for A-Level, AP, and IB Diploma
		if (test.type === 'A-Level' || test.type === 'AP' || test.type === 'IB Diploma') {
			const subjects = test.subjects || []
			if (subjects.length === 0) {
				hasError = true
				toast.error(t('test.validation.subjectRequired', { index: i + 1 }))
			}
		}
	}
	
	if (hasError) {
		return
	}
	
	emit('save', JSON.parse(JSON.stringify(standardizedTests.value)))
	// Don't exit edit mode yet; wait for parent to confirm save success via modelValue update
	pendingSave.value = true
}

function cancel() {
	if (props.modelValue) standardizedTests.value = JSON.parse(JSON.stringify(props.modelValue))
	// Clear validation errors
	validationErrors.type = standardizedTests.value.map(() => false)
	emit('cancel')
	pendingSave.value = false
	localEditing.value = false
}

function startEdit() {
	localEditing.value = true
	// Ensure there's at least one entry to edit
	if (standardizedTests.value.length === 0) {
		standardizedTests.value.push(createEntryForType(''))
		validationErrors.type.push(false)
	}
	emit('request-edit')
}

onMounted(() => {
	if (profileEditor && typeof profileEditor.register === 'function') {
		const unregister = profileEditor.register({ save: () => save(), cancel: () => cancel() })
		onBeforeUnmount(() => unregister())
	}
})
</script>

<template>
	<div :class="cn('flex flex-col gap-6', props.class)">
		<Card>
			<CardHeader class="text-left">
				<div class="flex items-center justify-between gap-4">
					<CardTitle class="text-3xl font-bold">
						{{ t('test.title') }}
					</CardTitle>
				<div v-if="!localEditing">
						<Button type="button" @click="startEdit">{{ t('profile.edit') }}</Button>
					</div>
					<div v-else class="flex gap-2">
						<Button type="button" variant="secondary" @click="cancel">{{ t('profile.cancel') }}</Button>
						<Button type="button" @click="save">{{ t('profile.save') }}</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div v-if="localEditing">
					<form @submit="save">
						<FieldGroup>
							<template v-for="(test, idx) in standardizedTests" :key="idx">
								<Field>
									<FieldLabel :for="`standardized-type-${idx}`">{{ t('test.type') }} <span class="text-red-500">*</span></FieldLabel>
									<Select v-model="test.type" @update:model-value="(val) => { resetFieldsForType(idx, (val ?? '') as StandardizedType); clearError(idx, 'type') }">
										<SelectTrigger :id="`standardized-type-${idx}`" :class="cn('w-full', validationErrors.type[idx] && 'border-red-500')">
											<SelectValue :placeholder="t('test.selectType')" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="IELTS">{{ t('test.types.ielts') }}</SelectItem>
											<SelectItem value="TOEFL iBT">{{ t('test.types.toeflIbt') }}</SelectItem>
											<SelectItem value="Duolingo English Test">{{ t('test.types.duolingo') }}</SelectItem>
											<SelectItem value="GRE">{{ t('test.types.gre') }}</SelectItem>
											<SelectItem value="GMAT">{{ t('test.types.gmat') }}</SelectItem>
											<SelectItem value="SAT">{{ t('test.types.sat') }}</SelectItem>
											<SelectItem value="ACT">{{ t('test.types.act') }}</SelectItem>
											<SelectItem value="A-Level">{{ t('test.types.aLevel') }}</SelectItem>
											<SelectItem value="AP">{{ t('test.types.ap') }}</SelectItem>
											<SelectItem value="IB Diploma">{{ t('test.types.ibDiploma') }}</SelectItem>
											<SelectItem value="Cambridge English C1 Advanced (CAE)">{{ t('test.types.cae') }}</SelectItem>
										</SelectContent>
									</Select>
								</Field>

								<div v-if="test.type === 'IELTS'" class="mt-2">
									<IELTSFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else-if="test.type === 'TOEFL iBT'" class="mt-2">
									<TOEFLFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else-if="test.type === 'Duolingo English Test'" class="mt-2">
									<DuolingoFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else-if="test.type === 'GRE'" class="mt-2">
									<GREFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else-if="test.type === 'GMAT'" class="mt-2">
									<GMATFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else-if="test.type === 'SAT'" class="mt-2">
									<SATFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else-if="test.type === 'ACT'" class="mt-2">
									<ACTFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else-if="test.type === 'A-Level'" class="mt-2">
									<ALevelFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else-if="test.type === 'AP'" class="mt-2">
									<APFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else-if="test.type === 'IB Diploma'" class="mt-2">
									<IBFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else-if="test.type === 'Cambridge English C1 Advanced (CAE)'" class="mt-2">
									<CAEFields :entry="test" :index="idx" :editable="true" />
								</div>
								<div v-else class="text-sm text-muted-foreground">
									{{ t('test.selectTypeHint') }}
								</div>

							<div class="flex justify-end gap-2 mt-2">
								<Button type="button" variant="secondary" @click="removeEntry(idx)">{{ t('profile.remove') }}</Button>
							</div>

							<FieldSeparator v-if="idx < standardizedTests.length - 1" />
							</template>
						</FieldGroup>
						
						<div class="flex justify-end gap-2 mt-4">
							<Button type="button" @click="addEntry">{{ t('profile.add') }}</Button>
						</div>
					</form>
				</div>
				<div v-else>
					<div v-if="standardizedTests && standardizedTests.length">
						<FieldGroup>
							<template v-for="(test, idx) in standardizedTests" :key="idx">
								<Field>
									<FieldLabel>{{ t('test.type') }}</FieldLabel>
									<div class="text-sm text-left">{{ typeLabel(test.type) }}</div>
								</Field>

								<div v-if="test.type === 'IELTS'" class="mt-2">
									<IELTSFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else-if="test.type === 'TOEFL iBT'" class="mt-2">
									<TOEFLFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else-if="test.type === 'Duolingo English Test'" class="mt-2">
									<DuolingoFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else-if="test.type === 'GRE'" class="mt-2">
									<GREFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else-if="test.type === 'GMAT'" class="mt-2">
									<GMATFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else-if="test.type === 'SAT'" class="mt-2">
									<SATFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else-if="test.type === 'ACT'" class="mt-2">
									<ACTFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else-if="test.type === 'A-Level'" class="mt-2">
									<ALevelFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else-if="test.type === 'AP'" class="mt-2">
									<APFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else-if="test.type === 'IB Diploma'" class="mt-2">
									<IBFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else-if="test.type === 'Cambridge English C1 Advanced (CAE)'" class="mt-2">
									<CAEFields :entry="test" :index="idx" :editable="false" />
								</div>
								<div v-else class="text-sm text-muted-foreground">
									-
								</div>
							</template>
						</FieldGroup>
					</div>
					<div v-else class="text-center text-muted-foreground">
						<div class="mb-2">{{ t('test.empty') }}</div>
					<Button type="button" @click="startEdit">{{ t('test.add') }}</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</template>
