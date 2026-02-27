<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SidebarPage from '../Sidebar.vue'
import BasicInformation from '@/components/Profile/BasicInformation.vue'
import EducationBackground from '@/components/Profile/EducationBackground.vue'
import Internship from '@/components/Profile/Internship.vue'
import Project from '@/components/Profile/Project.vue'
import CampusExperience from '@/components/Profile/CampusExperience.vue'
import Award from '@/components/Profile/Award.vue'
import { getPersonalInfo } from '@/api/userApi'
import { useUserStore } from '@/stores/userStore'

const { t } = useI18n()
const userStore = useUserStore()
const token = userStore.user?.token || ''

const informationData = ref<any[] | undefined>(undefined)
const educationData = ref<any[] | undefined>(undefined)
const internshipData = ref<any[] | undefined>(undefined)
const projectData = ref<any[] | undefined>(undefined)
const campusExpData = ref<any[] | undefined>(undefined)
const awardData = ref<any[] | undefined>(undefined)

onMounted(async () => {
	if (!token) return
	try {
		const res = await getPersonalInfo(token)
		informationData.value = [res.data]
	} catch (e) {
		// Let the card show its own error message on save;
	}
})

function onInformationSave(payload: any) {
	informationData.value = payload
}

function onEducationSave(payload: any) {
	educationData.value = payload
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