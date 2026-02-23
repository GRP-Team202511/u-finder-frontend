<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SidebarPage from '../Sidebar.vue'
import BasicInformation from '@/components/Profile/BasicInformation.vue'
import EducationBackground from '@/components/Profile/EducationBackground.vue'
import Internship from '@/components/Profile/Internship.vue'
import Project from '@/components/Profile/Project.vue'
import CampusExperience from '@/components/Profile/CampusExperience.vue'
import Award from '@/components/Profile/Award.vue'

const { t } = useI18n()

const informationData = ref<any[] | undefined>(undefined)
const educationData = ref<any[] | undefined>(undefined)
const internshipData = ref<any[] | undefined>(undefined)
const projectData = ref<any[] | undefined>(undefined)
const campusExpData = ref<any[] | undefined>(undefined)
const awardData = ref<any[] | undefined>(undefined)

function onInformationSave(payload: any) {
	informationData.value = payload
}

function onInformationCancel() {
}

function onEducationSave(payload: any) {
	educationData.value = payload
}

function onEducationCancel() {
}

function onInternshipSave(payload: any) {
	internshipData.value = payload
}

function onInternshipCancel() {
}

function onProjectSave(payload: any) {
	projectData.value = payload
}

function onProjectCancel() {
}

function onCampusExpSave(payload: any) {
	campusExpData.value = payload
}

function onCampusExpCancel() {
}

function onAwardSave(payload: any) {
	awardData.value = payload
}

function onAwardCancel() {
}

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
				@cancel="onInformationCancel"
			/>

			<EducationBackground
				:modelValue="educationData"
				@update:modelValue="educationData = $event"
				@save="onEducationSave"
				@cancel="onEducationCancel"
			/>
			
			<Internship
				:modelValue="internshipData"
				@update:modelValue="internshipData = $event"
				@save="onInternshipSave"
				@cancel="onInternshipCancel"
			/>

			<Project
				:modelValue="projectData"
				@update:modelValue="projectData = $event"
				@save="onProjectSave"
				@cancel="onProjectCancel"
			/>

			<CampusExperience
				:modelValue="campusExpData"
				@update:modelValue="campusExpData = $event"
				@save="onCampusExpSave"
				@cancel="onCampusExpCancel"
			/>

			<Award
				:modelValue="awardData"
				@update:modelValue="awardData = $event"
				@save="onAwardSave"
				@cancel="onAwardCancel"
			/>
		</div>
	</div>
</template>