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
import { getPersonalInfo } from '@/api/userApi'
import { useUserStore } from '@/stores/userStore'

const { t } = useI18n()
const userStore = useUserStore()
const token = computed(() => userStore.user?.token || '')

const informationData = ref<any | undefined>(undefined)
const educationData = ref<any[] | undefined>(undefined)
const academicOutcomeData = ref<any[] | undefined>(undefined)
const standardizedTestData = ref<any[] | undefined>(undefined)
const internshipData = ref<any[] | undefined>(undefined)
const projectData = ref<any[] | undefined>(undefined)
const campusExpData = ref<any[] | undefined>(undefined)
const awardData = ref<any[] | undefined>(undefined)
const personalInfoLoadError = ref('')

watch(
	() => token.value,
	async (nextToken) => {
		if (!nextToken) {
			informationData.value = undefined
			personalInfoLoadError.value = ''
			return
		}
		try {
			const res = await getPersonalInfo(nextToken)
			informationData.value = res.data
			personalInfoLoadError.value = ''
		} catch (e) {
			personalInfoLoadError.value = t('info.errors.loadFailed') || 'Failed to load personal information.'
			console.error('Failed to load personal information', e)
		}
	},
	{ immediate: true }
)

function onInformationSave(payload: any) {
	informationData.value = payload
}

function onEducationSave(payload: any) {
	educationData.value = payload
}

function onAcademicOutcomeSave(payload: any) {
	academicOutcomeData.value = payload
}

function onStandardizedTestSave(payload: any) {
	standardizedTestData.value = payload
}

function onInternshipSave(payload: any) {
	internshipData.value = payload
}

function onProjectSave(payload: any) {
	projectData.value = payload
}

function onCampusExpSave(payload: any) {
	campusExpData.value = payload
}

function onAwardSave(payload: any) {
	awardData.value = payload
}

</script>

<template>
	<div class="p-4">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-3xl font-bold">{{ t('profile.title') || 'Profile' }}</h1>
		</div>
			
		<div class="space-y-8">
			<div v-if="personalInfoLoadError" class="text-sm text-destructive">
				{{ personalInfoLoadError }}
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
				:modelValue="academicOutcomeData"
				@update:modelValue="academicOutcomeData = $event"
				@save="onAcademicOutcomeSave"
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