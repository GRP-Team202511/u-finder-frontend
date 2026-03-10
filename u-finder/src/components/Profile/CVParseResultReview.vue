<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CVParseResponse } from '@/types/profileTypes'

const { t } = useI18n()

// Props
interface Props {
  open?: boolean
  data: CVParseResponse | null
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  data: null,
})

// Emits
interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm', selections: FieldSelections): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

// Types
interface FieldSelections {
  personalInfo: boolean
  education: boolean
  academic: boolean
  test: boolean
  internship: boolean
  project: boolean
  campus: boolean
  award: boolean
}

// Local state
const isOpen = ref(props.open)
const selections = ref<FieldSelections>({
  personalInfo: false,
  education: false,
  academic: false,
  test: false,
  internship: false,
  project: false,
  campus: false,
  award: false,
})

// Watch for prop changes
watch(() => props.open, (newVal) => {
  isOpen.value = newVal
  if (newVal && props.data) {
    // Reset selections and auto-select sections with data
    initializeSelections()
  }
})

// Update parent when local state changes
watch(isOpen, (newVal) => {
  emit('update:open', newVal)
})

// Initialize selections based on available data
function initializeSelections() {
  if (!props.data) return
  
  selections.value = {
    personalInfo: hasPersonalInfo(),
    education: props.data.education.data.length > 0,
    academic: props.data.academic.data.length > 0,
    test: props.data.test.data.length > 0,
    internship: props.data.internship.data.length > 0,
    project: props.data.project.data.length > 0,
    campus: props.data.campus.data.length > 0,
    award: props.data.award.data.length > 0,
  }
}

// Check if personal info has data
function hasPersonalInfo(): boolean {
  if (!props.data) return false
  const info = props.data.personalInfo
  return !!(info.name || info.gender || info.birthday)
}

// Computed
const allSelected = computed(() => {
  return Object.values(selections.value).every(v => v)
})

const someSelected = computed(() => {
  return Object.values(selections.value).some(v => v)
})

const sectionsData = computed(() => {
  if (!props.data) return []
  
  return [
    {
      key: 'personalInfo',
      title: t('info.title') || 'Personal Information',
      action: t('profile.cvParser.actions.overwrite') || 'Overwrite',
      hasData: hasPersonalInfo(),
      count: hasPersonalInfo() ? 1 : 0,
      preview: formatPersonalInfo(),
    },
    {
      key: 'education',
      title: t('edu.title') || 'Education Background',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.education.data.length > 0,
      count: props.data.education.data.length,
      preview: formatEducation(),
    },
    {
      key: 'academic',
      title: t('academic.title') || 'Academic Outcomes',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.academic.data.length > 0,
      count: props.data.academic.data.length,
      preview: formatAcademic(),
    },
    {
      key: 'test',
      title: t('test.title') || 'Standardized Tests',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.test.data.length > 0,
      count: props.data.test.data.length,
      preview: formatTest(),
    },
    {
      key: 'internship',
      title: t('internship.title') || 'Internship',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.internship.data.length > 0,
      count: props.data.internship.data.length,
      preview: formatInternship(),
    },
    {
      key: 'project',
      title: t('project.title') || 'Projects',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.project.data.length > 0,
      count: props.data.project.data.length,
      preview: formatProject(),
    },
    {
      key: 'campus',
      title: t('campusExp.title') || 'Campus Experience',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.campus.data.length > 0,
      count: props.data.campus.data.length,
      preview: formatCampus(),
    },
    {
      key: 'award',
      title: t('award.title') || 'Awards',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.award.data.length > 0,
      count: props.data.award.data.length,
      preview: formatAward(),
    },
  ]
})

// Format functions for preview
function formatPersonalInfo(): string[] {
  if (!props.data) return []
  const info = props.data.personalInfo
  const items: string[] = []
  if (info.name) items.push(`${t('info.name') || 'Name'}: ${info.name}`)
  if (info.gender) items.push(`${t('info.gender.title') || 'Gender'}: ${info.gender}`)
  if (info.birthday) items.push(`${t('info.birthday') || 'Birthday'}: ${info.birthday}`)
  return items
}

function formatEducation(): string[] {
  if (!props.data) return []
  return props.data.education.data.map(item => 
    `${item.name} - ${item.major} (${item.time.start} - ${item.time.end})`
  )
}

function formatAcademic(): string[] {
  if (!props.data) return []
  return props.data.academic.data.map(item => {
    if (item.type === 'research paper') {
      return `${t('academic.paper') || 'Paper'}: ${item.title}`
    } else {
      return `${t('academic.patent') || 'Patent'}: ${item.title}`
    }
  })
}

function formatTest(): string[] {
  if (!props.data) return []
  return props.data.test.data.map(item => 
    `${item.type} - ${item.test_date}`
  )
}

function formatInternship(): string[] {
  if (!props.data) return []
  return props.data.internship.data.map(item => 
    `${item.company} - ${item.role}`
  )
}

function formatProject(): string[] {
  if (!props.data) return []
  return props.data.project.data.map(item => 
    `${item.name} - ${item.role}`
  )
}

function formatCampus(): string[] {
  if (!props.data) return []
  return props.data.campus.data.map(item => item.name)
}

function formatAward(): string[] {
  if (!props.data) return []
  return props.data.award.data.map(item => item.name)
}

// Toggle all selections
function toggleAll() {
  const newValue = !allSelected.value
  Object.keys(selections.value).forEach(key => {
    const sectionKey = key as keyof FieldSelections
    const section = sectionsData.value.find(s => s.key === sectionKey)
    if (section?.hasData) {
      selections.value[sectionKey] = newValue
    }
  })
}

// Confirm selection
function confirmSelection() {
  emit('confirm', { ...selections.value })
  isOpen.value = false
}

// Cancel
function cancel() {
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-200 max-h-[85vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>{{ t('profile.cvParser.reviewTitle') || 'Review Parsed Data' }}</DialogTitle>
        <DialogDescription>
          {{ t('profile.cvParser.reviewDescription') || 'Select the sections you want to import to your profile.' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto py-4">
        <!-- Select All Checkbox -->
        <div class="flex items-center space-x-2 mb-4 pb-4 border-b">
          <Checkbox
            :id="'select-all'"
            :checked="allSelected"
            :indeterminate="someSelected && !allSelected"
            @update:checked="toggleAll"
          />
          <Label
            :for="'select-all'"
            class="text-sm font-medium cursor-pointer"
          >
            {{ t('profile.cvParser.selectAll') || 'Select All' }}
          </Label>
        </div>

        <!-- Carousel for sections -->
        <Carousel class="w-full">
          <CarouselContent class="-ml-4">
            <CarouselItem
              v-for="section in sectionsData"
              :key="section.key"
              class="pl-4 basis-full lg:basis-1/2"
            >
              <Card
                class="h-full"
                :class="{
                  'opacity-50': !section.hasData
                }"
              >
                <CardHeader class="pb-4">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center space-x-2 flex-1">
                      <Checkbox
                        :id="`select-${section.key}`"
                        v-model:checked="selections[section.key as keyof FieldSelections]"
                        :disabled="!section.hasData"
                        class="mt-0.5"
                      />
                      <div class="flex-1 min-w-0">
                        <Label
                          :for="`select-${section.key}`"
                          class="text-base font-semibold cursor-pointer leading-none"
                        >
                          {{ section.title }}
                        </Label>
                        <div class="flex items-center gap-2 mt-1.5">
                          <!-- <span
                            class="text-xs px-2 py-0.5 rounded font-medium"
                            :class="section.key === 'personalInfo' 
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'"
                          >
                            {{ section.action }}
                          </span> -->
                          <span class="text-sm text-muted-foreground">
                            {{ section.count }} {{ section.count === 1 ? 'item' : 'items' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="pt-0">
                  <div v-if="section.hasData" class="space-y-2">
                    <p
                      v-for="(item, idx) in section.preview.slice(0, 3)"
                      :key="idx"
                      class="text-sm text-muted-foreground truncate"
                    >
                      {{ item }}
                    </p>
                    <p
                      v-if="section.preview.length > 3"
                      class="text-sm text-muted-foreground italic"
                    >
                      +{{ section.preview.length - 3 }} more...
                    </p>
                  </div>
                  <p v-else class="text-sm text-muted-foreground italic">
                    {{ t('profile.cvParser.noData') || 'No data found' }}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <div class="flex items-center justify-center gap-2 mt-4">
            <CarouselPrevious class="static translate-y-0" />
            <CarouselNext class="static translate-y-0" />
          </div>
        </Carousel>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="cancel">
          {{ t('profile.cancel') || 'Cancel' }}
        </Button>
        <Button 
          @click="confirmSelection"
          :disabled="!someSelected"
        >
          {{ t('profile.cvParser.confirmImport') || 'Confirm Import' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
