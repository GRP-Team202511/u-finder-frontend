<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BasicInformation from '@/components/Profile/BasicInformation.vue'
import EducationBackground from '@/components/Profile/EducationBackground.vue'
import AcademicOutcome from '@/components/Profile/AcademicOutcome/AcademicOutcome.vue'
import StandardizedTest from '@/components/Profile/StandardizedTest/StandardizedTest.vue'
import Internship from '@/components/Profile/Internship.vue'
import Project from '@/components/Profile/Project.vue'
import CampusExperience from '@/components/Profile/CampusExperience.vue'
import Award from '@/components/Profile/Award.vue'
import { getAllProfile, updatePersonalInfo, updateProfileField } from '@/api/profileApi'
import type { PersonalInfo } from '@/api/profileTypes'
import { useUserStore } from '@/stores/userStore'

const { t } = useI18n()
const userStore = useUserStore()
const token = computed(() => userStore.user?.token || '')

// Profile section data — undefined means not yet loaded
const informationData = ref<PersonalInfo | undefined>(undefined)
const educationData = ref<any[] | undefined>(undefined)
const academicOutcomeData = ref<any[] | undefined>(undefined)
const standardizedTestData = ref<any[] | undefined>(undefined)
const internshipData = ref<any[] | undefined>(undefined)
const projectData = ref<any[] | undefined>(undefined)
const campusExpData = ref<any[] | undefined>(undefined)
const awardData = ref<any[] | undefined>(undefined)

const loadError = ref('')

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
			loadError.value = ''
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
			loadError.value = ''
		} catch (e) {
			loadError.value = t('info.errors.loadFailed') || 'Failed to load profile.'
			console.error('Failed to load profile', e)
		}
	},
	{ immediate: true }
)

// Save personal info and persist to backend
async function onInformationSave(payload: PersonalInfo) {
	informationData.value = payload
	try {
		await updatePersonalInfo(payload)
	} catch (e) {
		console.error('Failed to save personal info', e)
	}
}

// Save education background and persist to backend
async function onEducationSave(payload: any[]) {
	educationData.value = payload
	try {
		await updateProfileField('education', payload)
	} catch (e) {
		console.error('Failed to save education', e)
	}
}

// Save academic outcomes and persist to backend
async function onAcademicOutcomeSave(payload: any[]) {
	academicOutcomeData.value = payload
	try {
		await updateProfileField('academic', payload)
	} catch (e) {
		console.error('Failed to save academic outcomes', e)
	}
}

// Save standardized tests and persist to backend
async function onStandardizedTestSave(payload: any[]) {
	standardizedTestData.value = payload
	try {
		await updateProfileField('test', payload)
	} catch (e) {
		console.error('Failed to save standardized tests', e)
	}
}

// Save internship experience and persist to backend
async function onInternshipSave(payload: any[]) {
	internshipData.value = payload
	try {
		await updateProfileField('internship', payload)
	} catch (e) {
		console.error('Failed to save internship', e)
	}
}

// Save project experience and persist to backend
async function onProjectSave(payload: any[]) {
	projectData.value = payload
	try {
		await updateProfileField('project', payload)
	} catch (e) {
		console.error('Failed to save project', e)
	}
}

// Save campus experience and persist to backend
async function onCampusExpSave(payload: any[]) {
	campusExpData.value = payload
	try {
		await updateProfileField('campus', payload)
	} catch (e) {
		console.error('Failed to save campus experience', e)
	}
}

// Save awards and persist to backend
async function onAwardSave(payload: any[]) {
	awardData.value = payload
	try {
		await updateProfileField('award', payload)
	} catch (e) {
		console.error('Failed to save awards', e)
	}
}

</script>

<template>
	<div class="p-4">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-3xl font-bold">{{ t('profile.title') || 'Profile' }}</h1>
		</div>
			
		<div class="space-y-8">
			<div v-if="loadError" class="text-sm text-destructive">
				{{ loadError }}
			</div>
			<BasicInformation
				:modelValue="informationData"
				@update:modelValue="informationData = $event"
				@save="onInformationSave"
			/>

			<EducationBackground
				:modelValue="educationData"
				@update:modelValue="educationData = $event"
				@save="onEducationSave"
			/>

			<AcademicOutcome
				:modelValue="academicOutcomeData"
				@update:modelValue="academicOutcomeData = $event"
				@save="onAcademicOutcomeSave"
			/>

			<StandardizedTest
				:modelValue="standardizedTestData"
				@update:modelValue="standardizedTestData = $event"
				@save="onStandardizedTestSave"
			/>
			
			<Internship
				:modelValue="internshipData"
				@update:modelValue="internshipData = $event"
				@save="onInternshipSave"
			/>

			<Project
				:modelValue="projectData"
				@update:modelValue="projectData = $event"
				@save="onProjectSave"
			/>

			<CampusExperience
				:modelValue="campusExpData"
				@update:modelValue="campusExpData = $event"
				@save="onCampusExpSave"
			/>

			<Award
				:modelValue="awardData"
				@update:modelValue="awardData = $event"
				@save="onAwardSave"
			/>
		</div>
	</div>
</template>