<script setup lang="ts">
import { ref, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import SidebarPage from '../SidebarLayout.vue'
import EducationBackground from '@/components/Profile/EducationBackground.vue'
import { Button } from '@/components/ui/button'

const { t } = useI18n()

const editing = ref(false)
const educationData = ref<any[] | undefined>(undefined)

// simple registration API for child components to participate in global save/cancel
const registry = new Set<{ save: () => void; cancel?: () => void }>()
const profileEditor = {
	register(handlers: { save: () => void; cancel?: () => void }) {
		registry.add(handlers)
		return () => registry.delete(handlers)
	},
	saveAll() {
		for (const h of registry) h.save()
	},
	cancelAll() {
		for (const h of registry) h.cancel && h.cancel()
	}
}
provide('profileEditor', profileEditor)

function onEducationSave(payload: any) {
	educationData.value = payload
	editing.value = false
}

function onEducationCancel() {
	editing.value = false
}
</script>

<template>
	<div class="p-4">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-3xl font-bold">{{ t('profile.title') || 'Profile' }}</h1>
			<div>
				<template v-if="!editing">
					<Button @click="editing = true">{{ t('profile.edit') || 'Edit' }}</Button>
				</template>
				<template v-else>
					<div class="flex gap-2">
						<Button variant="secondary" @click.prevent="(function(){ profileEditor.cancelAll(); editing = false })()">{{ t('profile.cancel') || 'Cancel' }}</Button>
						<Button @click.prevent="(function(){ profileEditor.saveAll(); editing = false })()">{{ t('profile.save') || 'Save' }}</Button>
					</div>
				</template>
			</div>
		</div>

		<EducationBackground
			:modelValue="educationData"
			:editable="editing"
			@update:modelValue="educationData = $event"
			@save="onEducationSave"
			@cancel="onEducationCancel"
			@request-edit="editing = true"
		/>
	</div>
</template>