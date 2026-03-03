<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
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
import { computed, ref, inject, onBeforeUnmount, onMounted, getCurrentInstance, watch } from 'vue'
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
	editable?: boolean
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', payload: StandardizedEntry[]): void
	(e: 'save', payload: StandardizedEntry[]): void
	(e: 'cancel'): void
	(e: 'request-edit'): void
}>()

// participate in global profile edit/save/cancel via optional provided API
type ProfileEditor = {
	register: (h: { save: () => void; cancel?: () => void }) => () => void
}
const profileEditor = inject<ProfileEditor | null>('profileEditor', null)

// local edit state (used when parent does not control `editable`)
const localEditing = ref(false)
const instance = getCurrentInstance()
const hasEditableProp = computed(() => !!(instance?.vnode.props && Object.prototype.hasOwnProperty.call(instance.vnode.props, 'editable')))
const isEditable = computed(() => (hasEditableProp.value ? props.editable : localEditing.value))

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

watch(
	() => props.modelValue,
	(nv) => {
		if (!isEditable.value && nv) standardizedTests.value = JSON.parse(JSON.stringify(nv))
	},
	{ deep: true }
)

function resetFieldsForType(index: number, nextType: StandardizedType) {
	const current = standardizedTests.value[index]
	if (current?.type === nextType) return
	standardizedTests.value[index] = createEntryForType(nextType)
}

function typeLabel(type: StandardizedType) {
	if (type === 'IELTS') return t('test.types.ielts') || 'IELTS'
	if (type === 'TOEFL iBT') return t('test.types.toeflIbt') || 'TOEFL iBT'
	if (type === 'Duolingo English Test') return t('test.types.duolingo') || 'Duolingo English Test'
	if (type === 'GRE') return t('test.types.gre') || 'GRE'
	if (type === 'GMAT') return t('test.types.gmat') || 'GMAT'
	if (type === 'SAT') return t('test.types.sat') || 'SAT'
	if (type === 'ACT') return t('test.types.act') || 'ACT'
	if (type === 'A-Level') return t('test.types.aLevel') || 'A-Level'
	if (type === 'AP') return t('test.types.ap') || 'AP'
	if (type === 'IB Diploma') return t('test.types.ibDiploma') || 'IB Diploma'
	if (type === 'Cambridge English C1 Advanced (CAE)') return t('test.types.cae') || 'Cambridge English C1 Advanced (CAE)'
	return '-'
}

function addEntry() {
	standardizedTests.value.push(createEntryForType(''))
}

function removeEntry(index: number) {
	if (standardizedTests.value.length > 1) standardizedTests.value.splice(index, 1)
}

function save(e?: Event) {
	if (e && e.preventDefault) e.preventDefault()
	emit('update:modelValue', JSON.parse(JSON.stringify(standardizedTests.value)))
	emit('save', JSON.parse(JSON.stringify(standardizedTests.value)))
	if (!hasEditableProp.value) localEditing.value = false
}

function cancel() {
	if (props.modelValue) standardizedTests.value = JSON.parse(JSON.stringify(props.modelValue))
	emit('cancel')
	if (!hasEditableProp.value) localEditing.value = false
}

function startEdit() {
	if (!hasEditableProp.value) localEditing.value = true
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
						{{ t('test.title') || 'Standardized Test' }}
					</CardTitle>
					<div v-if="!isEditable">
						<Button type="button" @click="startEdit">{{ t('profile.edit') || 'Edit' }}</Button>
					</div>
					<div v-else class="flex gap-2">
						<Button type="button" variant="secondary" @click="cancel">{{ t('profile.cancel') || 'Cancel' }}</Button>
						<Button type="button" @click="save">{{ t('profile.save') || 'Save' }}</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div v-if="isEditable">
					<form @submit="save">
						<FieldGroup>
							<template v-for="(test, idx) in standardizedTests" :key="idx">
								<Field>
									<FieldLabel :for="`standardized-type-${idx}`">{{ t('test.type') || 'Type' }}</FieldLabel>
									<Select v-model="test.type" @update:model-value="(val) => resetFieldsForType(idx, (val ?? '') as StandardizedType)">
										<SelectTrigger :id="`standardized-type-${idx}`" class="w-full">
											<SelectValue :placeholder="t('test.selectType') || 'Select test type'" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="IELTS">{{ t('test.types.ielts') || 'IELTS' }}</SelectItem>
											<SelectItem value="TOEFL iBT">{{ t('test.types.toeflIbt') || 'TOEFL iBT' }}</SelectItem>
											<SelectItem value="Duolingo English Test">{{ t('test.types.duolingo') || 'Duolingo English Test' }}</SelectItem>
											<SelectItem value="GRE">{{ t('test.types.gre') || 'GRE' }}</SelectItem>
											<SelectItem value="GMAT">{{ t('test.types.gmat') || 'GMAT' }}</SelectItem>
											<SelectItem value="SAT">{{ t('test.types.sat') || 'SAT' }}</SelectItem>
											<SelectItem value="ACT">{{ t('test.types.act') || 'ACT' }}</SelectItem>
											<SelectItem value="A-Level">{{ t('test.types.aLevel') || 'A-Level' }}</SelectItem>
											<SelectItem value="AP">{{ t('test.types.ap') || 'AP' }}</SelectItem>
											<SelectItem value="IB Diploma">{{ t('test.types.ibDiploma') || 'IB Diploma' }}</SelectItem>
											<SelectItem value="Cambridge English C1 Advanced (CAE)">{{ t('test.types.cae') || 'Cambridge English C1 Advanced (CAE)' }}</SelectItem>
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
									{{ t('test.selectTypeHint') || 'Select a type to enter details.' }}
								</div>

								<div class="flex justify-end gap-2 mt-2">
									<Button v-if="standardizedTests.length > 1" type="button" variant="secondary" @click="removeEntry(idx)">{{ t('profile.remove') || 'Remove' }}</Button>
									<Button type="button" @click="addEntry">{{ t('profile.add') || 'Add' }}</Button>
								</div>
							</template>
						</FieldGroup>
					</form>
				</div>
				<div v-else>
					<div v-if="standardizedTests && standardizedTests.length">
						<FieldGroup>
							<template v-for="(test, idx) in standardizedTests" :key="idx">
								<Field>
									<FieldLabel>{{ t('test.type') || 'Type' }}</FieldLabel>
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
						<div class="mb-2">{{ t('test.empty') || 'No standardized tests' }}</div>
						<Button type="button" @click="$emit('request-edit')">{{ t('test.add') || 'Add standardized test' }}</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</template>
