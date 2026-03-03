<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import BasicInformation from '@/components/Profile/BasicInformation.vue'
import EducationBackground from '@/components/Profile/EducationBackground.vue'
import AcademicOutcome from '@/components/Profile/AcademicOutcome/AcademicOutcome.vue'
import StandardizedTest from '@/components/Profile/StandardizedTest/StandardizedTest.vue'
import Internship from '@/components/Profile/Internship.vue'
import Project from '@/components/Profile/Project.vue'
import CampusExperience from '@/components/Profile/CampusExperience.vue'
import Award from '@/components/Profile/Award.vue'
import { getAllProfile, updateProfileField } from '@/api/profileApi'
import type { PersonalInfo } from '@/api/profileTypes'
import { useUserStore } from '@/stores/userStore'

const { t } = useI18n()
const userStore = useUserStore()
const token = computed(() => userStore.user?.token || '')

// Track how many components are currently in edit mode
const editingComponentsCount = ref(0)

// Profile section data — undefined means not yet loaded
const informationData = ref<PersonalInfo | undefined>(undefined)
const educationData = ref<any[] | undefined>(undefined)
const academicOutcomeData = ref<any[] | undefined>(undefined)
const standardizedTestData = ref<any[] | undefined>(undefined)
const internshipData = ref<any[] | undefined>(undefined)
const projectData = ref<any[] | undefined>(undefined)
const campusExpData = ref<any[] | undefined>(undefined)
const awardData = ref<any[] | undefined>(undefined)

// Load all profile sections at once when the user is authenticated
watch(
	() => token.value,
	async (nextToken) => {
		if (!nextToken) {
			// Clear all data on logout
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
		} catch (e) {
			toast.error(t('profile.toast.loadFailed'))
			console.error('Failed to load profile', e)
		}
	},
	{ immediate: true }
)

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

// Track editing status to prevent accidental page close
function onComponentStartEdit() {
	editingComponentsCount.value++
}

function onComponentEndEdit() {
	if (editingComponentsCount.value > 0) {
		editingComponentsCount.value--
	}
}

// Warn user before leaving page if any component is in edit mode
function handleBeforeUnload(e: BeforeUnloadEvent) {
	if (editingComponentsCount.value > 0) {
		// Modern browsers (Chrome 51+, Firefox 44+, Safari 9.1+) only need preventDefault()
		e.preventDefault()
		// Returning any value (including undefined) is enough for legacy browsers
		// The browser will show its own confirmation dialog
	}
}

// Setup and cleanup beforeunload listener
onMounted(() => {
	window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
	window.removeEventListener('beforeunload', handleBeforeUnload)
})

</script>

<template>
	<div class="p-4">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-3xl font-bold">{{ t('profile.title') || 'Profile' }}</h1>
		</div>
			
		<div class="space-y-8">
			<BasicInformation
				:modelValue="informationData"
				@update:modelValue="informationData = $event"
				@save="onInformationSave"
				@request-edit="onComponentStartEdit"
				@cancel="onComponentEndEdit"
				@edit-complete="onComponentEndEdit"
			/>

			<EducationBackground
				:modelValue="educationData"
				@save="onEducationSave"
				@request-edit="onComponentStartEdit"
				@cancel="onComponentEndEdit"
				@edit-complete="onComponentEndEdit"
			/>

			<AcademicOutcome
				:modelValue="academicOutcomeData"
				@save="onAcademicOutcomeSave"
				@request-edit="onComponentStartEdit"
				@cancel="onComponentEndEdit"
				@edit-complete="onComponentEndEdit"
			/>

			<StandardizedTest
				:modelValue="standardizedTestData"
				@save="onStandardizedTestSave"
				@request-edit="onComponentStartEdit"
				@cancel="onComponentEndEdit"
				@edit-complete="onComponentEndEdit"
			/>
			
			<Internship
				:modelValue="internshipData"
				@save="onInternshipSave"
				@request-edit="onComponentStartEdit"
				@cancel="onComponentEndEdit"
				@edit-complete="onComponentEndEdit"
			/>

			<Project
				:modelValue="projectData"
				@save="onProjectSave"
				@request-edit="onComponentStartEdit"
				@cancel="onComponentEndEdit"
				@edit-complete="onComponentEndEdit"
			/>

			<CampusExperience
				:modelValue="campusExpData"
				@save="onCampusExpSave"
				@request-edit="onComponentStartEdit"
				@cancel="onComponentEndEdit"
				@edit-complete="onComponentEndEdit"
			/>

			<Award
				:modelValue="awardData"
				@save="onAwardSave"
				@request-edit="onComponentStartEdit"
				@cancel="onComponentEndEdit"
				@edit-complete="onComponentEndEdit"
			/>
		</div>
	</div>
</template>