<script setup lang="ts">
import { computed, ref, watch, provide, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Save, X } from 'lucide-vue-next'
import BasicInformation from '@/components/Profile/BasicInformation.vue'
import EducationBackground from '@/components/Profile/EducationBackground.vue'
import AcademicOutcome from '@/components/Profile/AcademicOutcome/AcademicOutcome.vue'
import StandardizedTest from '@/components/Profile/StandardizedTest/StandardizedTest.vue'
import Internship from '@/components/Profile/Internship.vue'
import Project from '@/components/Profile/Project.vue'
import CampusExperience from '@/components/Profile/CampusExperience.vue'
import Award from '@/components/Profile/Award.vue'
import CVParserDialog from '@/components/Profile/CVParserDialog.vue'
import CVParseResultReview from '@/components/Profile/CVParseResultReview.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAllProfile, updateProfileField, updatePersonalInfo } from '@/api/profileApi'
import type { PersonalInfo, CVParseResponse, CVImportSelections, ImportMode } from '@/types/profileTypes'
import type { EditorRegistration, ProfileEditor } from '@/types/profileEditor'
import { useUserStore } from '@/stores/userStore'
import { useSidebar } from '@/components/ui/sidebar'

const { t } = useI18n()
const { open: sidebarOpen, isMobile } = useSidebar()
const userStore = useUserStore()
const token = computed(() => userStore.user?.token || '')

// Track loading state
const isLoading = ref(false)
const loadError = ref(false)

// ─── Profile Editor Provider ──────────────────────────────────────────────────
const registeredEditors = new Map<number, EditorRegistration>()
const registeredEditorsVersion = ref(0)
let nextEditorId = 0

function registerEditor(handler: EditorRegistration): () => void {
	const id = nextEditorId++
	registeredEditors.set(id, handler)
	registeredEditorsVersion.value++
	return () => {
		registeredEditors.delete(id)
		registeredEditorsVersion.value++
	}
}

const activeEl = ref<HTMLElement | null>(null)

function setActiveEl(el: HTMLElement | null) {
	activeEl.value = el
}

provide<ProfileEditor>('profileEditor', { register: registerEditor, setActiveEl })

const hasEditingEditors = computed(() => {
	registeredEditorsVersion.value
	for (const editor of registeredEditors.values()) {
		if (editor.isEditing.value) return true
	}
	return false
})

const editingComponentsCount = computed(() => {
	registeredEditorsVersion.value
	let count = 0
	for (const editor of registeredEditors.values()) {
		if (editor.isEditing.value) count++
	}
	return count
})

const isSavingAll = ref(false)

async function saveAll() {
	if (isSavingAll.value) return
	isSavingAll.value = true

	const editingEditors = [...registeredEditors.values()].filter(e => e.isEditing.value)
	if (editingEditors.length === 0) {
		isSavingAll.value = false
		return
	}

	// Scroll the currently focused/active card (or first editing card) into center
	const activeEditor = editingEditors.find(e => e.el?.value && e.el.value === activeEl.value)
	const scrollTarget = activeEditor?.el?.value ?? editingEditors.find(e => e.el?.value)?.el?.value
	if (scrollTarget) {
		scrollTarget.scrollIntoView({ block: 'center', behavior: 'smooth' })
		await new Promise(r => setTimeout(r, 350))
	}

	for (const editor of editingEditors) {
		editor.save()
	}

	// After calling save(), editors that passed validation will have isSaving=true.
	// Editors that failed validation return early and isSaving stays false.
	// Only wait for editors that actually initiated a save.
	const savingEditors = editingEditors.filter(e => e.isSaving?.value)

	if (savingEditors.length > 0) {
		await new Promise<void>((resolve) => {
			let stop: ReturnType<typeof watch> | undefined
			const timeout = setTimeout(() => { stop?.(); resolve() }, 15_000)
			stop = watch(
				() => savingEditors.every(e => !e.isEditing.value),
				(allDone) => {
					if (allDone) { clearTimeout(timeout); stop?.(); resolve() }
				},
				{ immediate: true },
			)
		})
	}

	isSavingAll.value = false
}

function cancelAll() {
	const editingEditors = [...registeredEditors.values()].filter(e => e.isEditing.value)
	for (const editor of editingEditors) {
		editor.cancel?.()
	}
}

// CV Parser Dialog state
const showCVParserDialog = ref(false)
const showCVResultReview = ref(false)
const cvParseResult = ref<CVParseResponse | null>(null)

// Profile section data — undefined means not yet loaded
const informationData = ref<PersonalInfo | undefined>(undefined)
const educationData = ref<any[] | undefined>(undefined)
const academicOutcomeData = ref<any[] | undefined>(undefined)
const standardizedTestData = ref<any[] | undefined>(undefined)
const internshipData = ref<any[] | undefined>(undefined)
const projectData = ref<any[] | undefined>(undefined)
const campusExpData = ref<any[] | undefined>(undefined)
const awardData = ref<any[] | undefined>(undefined)

// Load profile data function
async function loadProfile() {
	if (!token.value) {
		// Clear all data on logout
		isLoading.value = false
		loadError.value = false
		informationData.value = undefined
		educationData.value = undefined
		academicOutcomeData.value = undefined
		standardizedTestData.value = undefined
		internshipData.value = undefined
		projectData.value = undefined
		campusExpData.value = undefined
		awardData.value = undefined
		return
	}
	
	isLoading.value = true
	loadError.value = false
	
	try {
		const res = await getAllProfile()
		const profile = res.data
		informationData.value = profile.personalInfo
		educationData.value = profile.education.data
		academicOutcomeData.value = profile.academic.data
		standardizedTestData.value = profile.test.data
		internshipData.value = profile.internship.data
		projectData.value = profile.project.data
		campusExpData.value = profile.campus.data
		awardData.value = profile.award.data
		loadError.value = false
	} catch (e) {
		loadError.value = true
		toast.error(t('profile.toast.loadFailed'))
		console.error('Failed to load profile', e)
	} finally {
		isLoading.value = false
	}
}

// Load all profile sections at once when the user is authenticated
watch(() => token.value, loadProfile, { immediate: true })

// Personal info is saved directly by BasicInformation component;
// here we only sync the local ref so the parent stays up to date.
function onInformationSave(payload: PersonalInfo) {
	informationData.value = payload
}

// Save education background and persist to backend
async function onEducationSave(payload: any[]) {
	try {
		await updateProfileField('education', payload)
		educationData.value = payload
		toast.success(t('profile.toast.education.saveSuccess'))
	} catch (e) {
		console.error('Failed to save education', e)
		toast.error(t('profile.toast.education.saveFailed'))
	}
}

// Save academic outcomes and persist to backend
async function onAcademicOutcomeSave(payload: any[]) {
	try {
		await updateProfileField('academic', payload)
		academicOutcomeData.value = payload
		toast.success(t('profile.toast.academic.saveSuccess'))
	} catch (e) {
		console.error('Failed to save academic outcomes', e)
		toast.error(t('profile.toast.academic.saveFailed'))
	}
}

// Save standardized tests and persist to backend
async function onStandardizedTestSave(payload: any[]) {
	try {
		await updateProfileField('test', payload)
		standardizedTestData.value = payload
		toast.success(t('profile.toast.test.saveSuccess'))
	} catch (e) {
		console.error('Failed to save standardized tests', e)
		toast.error(t('profile.toast.test.saveFailed'))
	}
}

// Save internship experience and persist to backend
async function onInternshipSave(payload: any[]) {
	try {
		await updateProfileField('internship', payload)
		internshipData.value = payload
		toast.success(t('profile.toast.internship.saveSuccess'))
	} catch (e) {
		console.error('Failed to save internship', e)
		toast.error(t('profile.toast.internship.saveFailed'))
	}
}

// Save project experience and persist to backend
async function onProjectSave(payload: any[]) {
	try {
		await updateProfileField('project', payload)
		projectData.value = payload
		toast.success(t('profile.toast.project.saveSuccess'))
	} catch (e) {
		console.error('Failed to save project', e)
		toast.error(t('profile.toast.project.saveFailed'))
	}
}

// Save campus experience and persist to backend
async function onCampusExpSave(payload: any[]) {
	try {
		await updateProfileField('campus', payload)
		campusExpData.value = payload
		toast.success(t('profile.toast.campusExp.saveSuccess'))
	} catch (e) {
		console.error('Failed to save campus experience', e)
		toast.error(t('profile.toast.campusExp.saveFailed'))
	}
}

// Save awards and persist to backend
async function onAwardSave(payload: any[]) {
	try {
		await updateProfileField('award', payload)
		awardData.value = payload
		toast.success(t('profile.toast.award.saveSuccess'))
	} catch (e) {
		console.error('Failed to save awards', e)
		toast.error(t('profile.toast.award.saveFailed'))
	}
}

// Warn user before leaving page if any component is in edit mode
function handleBeforeUnload(e: BeforeUnloadEvent) {
	if (editingComponentsCount.value > 0) {
		e.preventDefault()
	}
}

// Setup and cleanup beforeunload listener
onMounted(() => {
	window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
	window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Handle CV parse complete
function handleCVParseComplete(data: CVParseResponse) {
	cvParseResult.value = data
	showCVParserDialog.value = false
	showCVResultReview.value = true
}

// Handle CV result confirmation
async function handleCVResultConfirm(selections: CVImportSelections) {
	if (!cvParseResult.value) return
	
	const promises: Promise<any>[] = []
	
	try {
		// Update personal info (overwrite) — personalInfo is a single object so still read from cvParseResult
		if (selections.personalInfo) {
			const promise = updatePersonalInfo(cvParseResult.value.personalInfo)
				.then(() => {
					informationData.value = cvParseResult.value!.personalInfo
					toast.success(t('profile.toast.information.saveSuccess'))
				})
				.catch((e) => {
					console.error('Failed to update personal info:', e)
					toast.error(t('profile.toast.information.saveFailed'))
				})
			promises.push(promise)
		}
		
		// Append only the user-selected education items
		if (selections.education.items.length > 0) {
			const newData = selections.education.mode === 'overwrite'
				? selections.education.items
				: [...(educationData.value || []), ...selections.education.items]
			const promise = updateProfileField('education', newData)
				.then(() => {
					educationData.value = newData
					toast.success(t('profile.toast.education.saveSuccess'))
				})
				.catch((e) => {
					console.error('Failed to update education:', e)
					toast.error(t('profile.toast.education.saveFailed'))
				})
			promises.push(promise)
		}
		
		// Append only the user-selected academic items
		if (selections.academic.items.length > 0) {
			const newData = selections.academic.mode === 'overwrite'
				? selections.academic.items
				: [...(academicOutcomeData.value || []), ...selections.academic.items]
			const promise = updateProfileField('academic', newData)
				.then(() => {
					academicOutcomeData.value = newData
					toast.success(t('profile.toast.academic.saveSuccess'))
				})
				.catch((e) => {
					console.error('Failed to update academic:', e)
					toast.error(t('profile.toast.academic.saveFailed'))
				})
			promises.push(promise)
		}
		
		// Append only the user-selected test items
		if (selections.test.items.length > 0) {
			const newData = selections.test.mode === 'overwrite'
				? selections.test.items
				: [...(standardizedTestData.value || []), ...selections.test.items]
			const promise = updateProfileField('test', newData)
				.then(() => {
					standardizedTestData.value = newData
					toast.success(t('profile.toast.test.saveSuccess'))
				})
				.catch((e) => {
					console.error('Failed to update test:', e)
					toast.error(t('profile.toast.test.saveFailed'))
				})
			promises.push(promise)
		}
		
		// Append only the user-selected internship items
		if (selections.internship.items.length > 0) {
			const newData = selections.internship.mode === 'overwrite'
				? selections.internship.items
				: [...(internshipData.value || []), ...selections.internship.items]
			const promise = updateProfileField('internship', newData)
				.then(() => {
					internshipData.value = newData
					toast.success(t('profile.toast.internship.saveSuccess'))
				})
				.catch((e) => {
					console.error('Failed to update internship:', e)
					toast.error(t('profile.toast.internship.saveFailed'))
				})
			promises.push(promise)
		}
		
		// Append only the user-selected project items
		if (selections.project.items.length > 0) {
			const newData = selections.project.mode === 'overwrite'
				? selections.project.items
				: [...(projectData.value || []), ...selections.project.items]
			const promise = updateProfileField('project', newData)
				.then(() => {
					projectData.value = newData
					toast.success(t('profile.toast.project.saveSuccess'))
				})
				.catch((e) => {
					console.error('Failed to update project:', e)
					toast.error(t('profile.toast.project.saveFailed'))
				})
			promises.push(promise)
		}
		
		// Append only the user-selected campus items
		if (selections.campus.items.length > 0) {
			const newData = selections.campus.mode === 'overwrite'
				? selections.campus.items
				: [...(campusExpData.value || []), ...selections.campus.items]
			const promise = updateProfileField('campus', newData)
				.then(() => {
					campusExpData.value = newData
					toast.success(t('profile.toast.campusExp.saveSuccess'))
				})
				.catch((e) => {
					console.error('Failed to update campus:', e)
					toast.error(t('profile.toast.campusExp.saveFailed'))
				})
			promises.push(promise)
		}
		
		// Append only the user-selected award items
		if (selections.award.items.length > 0) {
			const newData = selections.award.mode === 'overwrite'
				? selections.award.items
				: [...(awardData.value || []), ...selections.award.items]
			const promise = updateProfileField('award', newData)
				.then(() => {
					awardData.value = newData
					toast.success(t('profile.toast.award.saveSuccess'))
				})
				.catch((e) => {
					console.error('Failed to update award:', e)
					toast.error(t('profile.toast.award.saveFailed'))
				})
			promises.push(promise)
		}
		
		// Wait for all updates to complete
		await Promise.all(promises)
		
		if (promises.length > 0) {
			toast.success(t('profile.cvParser.importSuccess'))
		}
		
	} catch (e) {
		console.error('Failed to import CV data:', e)
		toast.error(t('profile.cvParser.importFailed'))
	} finally {
		// Clean up
		cvParseResult.value = null
	}
}

// Handle CV result cancel
function handleCVResultCancel() {
	cvParseResult.value = null
}

</script>

<template>
	<div class="mx-auto w-full max-w-5xl p-3 sm:p-4">
		<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<h1 class="text-2xl font-bold sm:text-3xl">{{ t('profile.title') }}</h1>
			<Button @click="showCVParserDialog = true">
				{{ t('profile.cvParser.button') }}
			</Button>
		</div>
		
		<!-- Loading State -->
		<div v-if="isLoading" class="space-y-8">
			<Card v-for="i in 8" :key="i">
				<CardHeader>
					<Skeleton class="h-8 w-48" />
				</CardHeader>
				<CardContent class="space-y-4">
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-4 w-5/6" />
				</CardContent>
			</Card>
		</div>
		
		<!-- Error State -->
		<div v-else-if="loadError" class="flex flex-col items-center justify-center py-12">
			<Card class="w-full max-w-2xl">
				<CardHeader>
					<CardTitle class="text-center text-destructive text-xl">
						{{ t('profile.errors.loadFailed') }}
					</CardTitle>
				</CardHeader>
				<CardContent class="text-center text-muted-foreground">
					<p class="mb-4">{{ t('profile.errors.loadFailedDescription') }}</p>
					<button 
						@click="loadProfile"
						class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
					>
						{{ t('profile.retry') }}
					</button>
				</CardContent>
			</Card>
		</div>
		
		<!-- Content State -->	
		<div v-else class="space-y-8">
			<BasicInformation
				:modelValue="informationData"
				@update:modelValue="informationData = $event"
				@save="onInformationSave"
			/>

			<EducationBackground
				:modelValue="educationData"
				@save="onEducationSave"
			/>

			<AcademicOutcome
				:modelValue="academicOutcomeData"
				@save="onAcademicOutcomeSave"
			/>

			<StandardizedTest
				:modelValue="standardizedTestData"
				@save="onStandardizedTestSave"
			/>

			<Internship
				:modelValue="internshipData"
				@save="onInternshipSave"
			/>

			<Project
				:modelValue="projectData"
				@save="onProjectSave"
			/>

			<CampusExperience
				:modelValue="campusExpData"
				@save="onCampusExpSave"
			/>

			<Award
				:modelValue="awardData"
				@save="onAwardSave"
			/>
		</div>

		<!-- Save All / Cancel All dock -->
		<Transition
			enter-from-class="translate-y-full"
			leave-to-class="translate-y-full"
		>
			<div
				v-if="hasEditingEditors"
				class="fixed bottom-0 right-0 z-50 flex w-full flex-wrap items-center justify-center gap-2 border-t bg-background px-3 py-3 transition-[left,translate] duration-200 ease-linear sm:gap-3 sm:px-4"
				:style="{ left: !isMobile && sidebarOpen ? 'var(--sidebar-width, 16rem)' : '0' }"
			>
				<Button
					variant="outline"
					size="lg"
					class="w-full gap-2 sm:w-auto"
					:disabled="isSavingAll"
					@click="cancelAll"
				>
					<X class="size-4" />
					{{ t('profile.cancelAll') }}
				</Button>
				<Button
					size="lg"
					class="w-full gap-2 shadow-lg sm:w-auto"
					:disabled="isSavingAll"
					@click="saveAll"
				>
					<Spinner v-if="isSavingAll" class="size-4" />
					<Save v-else class="size-4" />
					{{ isSavingAll ? t('profile.savingAll') : t('profile.saveAll') }}
				</Button>
			</div>
		</Transition>
		
		<!-- CV Parser Dialog -->
		<CVParserDialog 
			v-model:open="showCVParserDialog"
			@parse-complete="handleCVParseComplete"
		/>
		
		<!-- CV Parse Result Review Dialog -->
		<CVParseResultReview
			v-model:open="showCVResultReview"
			:data="cvParseResult"
			@confirm="handleCVResultConfirm"
			@cancel="handleCVResultCancel"
		/>
	</div>
</template>