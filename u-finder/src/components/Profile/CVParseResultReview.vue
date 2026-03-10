<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
      items: hasPersonalInfo() ? [props.data.personalInfo] : [],
    },
    {
      key: 'education',
      title: t('edu.title') || 'Education Background',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.education.data.length > 0,
      count: props.data.education.data.length,
      preview: formatEducation(),
      items: props.data.education.data,
    },
    {
      key: 'academic',
      title: t('academic.title') || 'Academic Outcomes',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.academic.data.length > 0,
      count: props.data.academic.data.length,
      preview: formatAcademic(),
      items: props.data.academic.data,
    },
    {
      key: 'test',
      title: t('test.title') || 'Standardized Tests',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.test.data.length > 0,
      count: props.data.test.data.length,
      preview: formatTest(),
      items: props.data.test.data,
    },
    {
      key: 'internship',
      title: t('internship.title') || 'Internship',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.internship.data.length > 0,
      count: props.data.internship.data.length,
      preview: formatInternship(),
      items: props.data.internship.data,
    },
    {
      key: 'project',
      title: t('project.title') || 'Projects',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.project.data.length > 0,
      count: props.data.project.data.length,
      preview: formatProject(),
      items: props.data.project.data,
    },
    {
      key: 'campus',
      title: t('campusExp.title') || 'Campus Experience',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.campus.data.length > 0,
      count: props.data.campus.data.length,
      preview: formatCampus(),
      items: props.data.campus.data,
    },
    {
      key: 'award',
      title: t('award.title') || 'Awards',
      action: t('profile.cvParser.actions.append') || 'Append',
      hasData: props.data.award.data.length > 0,
      count: props.data.award.data.length,
      preview: formatAward(),
      items: props.data.award.data,
    },
  ]
})

const selectableSectionKeys = computed<(keyof FieldSelections)[]>(() => {
  return sectionsData.value
    .filter(section => section.hasData)
    .map(section => section.key as keyof FieldSelections)
})

const allSelected = computed(() => {
  if (selectableSectionKeys.value.length === 0) return false
  return selectableSectionKeys.value.every(key => selections.value[key])
})

const someSelected = computed(() => {
  return selectableSectionKeys.value.some(key => selections.value[key])
})

const selectAllChecked = computed<boolean | 'indeterminate'>(() => {
  if (allSelected.value) return true
  if (someSelected.value) return 'indeterminate'
  return false
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
function toggleAll(checked: boolean | 'indeterminate') {
  const newValue = checked === true
  selectableSectionKeys.value.forEach(sectionKey => {
    selections.value[sectionKey] = newValue
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

// Format detailed information for popover
function formatItemDetails(item: any, sectionKey: string): { label: string; value: string }[] {
  const details: { label: string; value: string }[] = []
  
  if (sectionKey === 'personalInfo') {
    if (item.name) details.push({ label: t('info.name') || 'Name', value: item.name })
    if (item.gender) details.push({ label: t('info.gender.title') || 'Gender', value: item.gender })
    if (item.birthday) details.push({ label: t('info.birthday') || 'Birthday', value: item.birthday })
  } else if (sectionKey === 'education') {
    details.push({ label: t('edu.type') || 'Type', value: item.type })
    details.push({ label: t('edu.institution') || 'Institution', value: item.name })
    details.push({ label: t('edu.major') || 'Major', value: item.major })
    details.push({ label: t('edu.time.start') || 'Start', value: item.time.start })
    details.push({ label: t('edu.time.end') || 'End', value: item.time.end })
    if (item.ranking) details.push({ label: t('edu.ranking') || 'Ranking', value: item.ranking })
    details.push({ label: t('edu.GPA') || 'GPA', value: `${item.GPA} / ${item['GPA-base']}` })
  } else if (sectionKey === 'academic') {
    if (item.type === 'research paper') {
      details.push({ label: t('academic.type.title') || 'Type', value: t('academic.type.researchPaper') || 'Research Paper' })
      details.push({ label: t('academic.researchPaper.title') || 'Title', value: item.title })
      if (item.doi) details.push({ label: t('academic.researchPaper.doi') || 'DOI', value: item.doi })
      if (item.abstract) details.push({ label: t('academic.researchPaper.abstract') || 'Abstract', value: item.abstract })
    } else {
      details.push({ label: t('academic.type.title') || 'Type', value: t('academic.type.patent') || 'Patent' })
      details.push({ label: t('academic.patent.title') || 'Title', value: item.title })
      if (item.patentNumber) details.push({ label: t('academic.patent.number') || 'Patent Number', value: item.patentNumber })
      if (item.region) details.push({ label: t('academic.patent.region') || 'Region', value: item.region })
      if (item.description) details.push({ label: t('academic.patent.description') || 'Description', value: item.description })
    }
  } else if (sectionKey === 'test') {
    details.push({ label: t('test.type') || 'Test Type', value: item.type })
    if (item.test_date) {
      details.push({ label: t('test.testDate') || 'Test Date', value: item.test_date })
    }
    // Add scores
    Object.entries(item.scores).forEach(([key, value]) => {
      if (value && value !== '') {
        details.push({ label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value: String(value) })
      }
    })
  } else if (sectionKey === 'internship') {
    details.push({ label: t('internship.company') || 'Company', value: item.company })
    details.push({ label: t('internship.role') || 'Role', value: item.role })
    details.push({ label: t('internship.time.start') || 'Start', value: item.time.start })
    details.push({ label: t('internship.time.end') || 'End', value: item.time.end })
    if (item.time.till_now) details.push({ label: '', value: t('internship.time.till now') || 'Till Now' })
    if (item.description) details.push({ label: t('internship.description') || 'Description', value: item.description })
  } else if (sectionKey === 'project') {
    details.push({ label: t('project.name') || 'Project Name', value: item.name })
    details.push({ label: t('project.role') || 'Role', value: item.role })
    details.push({ label: t('project.time.start') || 'Start', value: item.time.start })
    details.push({ label: t('project.time.end') || 'End', value: item.time.end })
    if (item.time.till_now) details.push({ label: '', value: t('project.time.till now') || 'Till Now' })
    if (item.description) details.push({ label: t('project.description') || 'Description', value: item.description })
  } else if (sectionKey === 'campus') {
    details.push({ label: t('campusExp.name') || 'Name', value: item.name })
    if (item.description) details.push({ label: t('campusExp.description') || 'Description', value: item.description })
  } else if (sectionKey === 'award') {
    details.push({ label: t('award.name') || 'Award Name', value: item.name })
    if (item.description) details.push({ label: t('award.description') || 'Description', value: item.description })
  }
  
  return details
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
            :model-value="selectAllChecked"
            @update:model-value="toggleAll"
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
                        v-model="selections[section.key as keyof FieldSelections]"
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
                            {{ section.count }} {{ section.count === 1 ? t('profile.cvParser.item') : t('profile.cvParser.items') }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="pt-0">
                  <div v-if="section.hasData" class="space-y-2">
                    <Popover
                      v-for="(item, idx) in section.items.slice(0, 3)"
                      :key="idx"
                    >
                      <PopoverTrigger class="w-full">
                        <div class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-2 rounded-md hover:bg-accent">
                          <Info class="h-4 w-4 shrink-0" />
                          <span class="truncate text-left flex-1">
                            {{ section.preview[idx] }}
                          </span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent class="w-80 max-h-96 overflow-y-auto">
                        <div class="space-y-3">
                          <div
                            v-for="(detail, detailIdx) in formatItemDetails(item, section.key)"
                            :key="detailIdx"
                            class="space-y-1"
                          >
                            <div class="text-xs font-medium text-muted-foreground">{{ detail.label }}</div>
                            <div class="text-sm">{{ detail.value }}</div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <p
                      v-if="section.items.length > 3"
                      class="text-sm text-muted-foreground italic pl-2"
                    >
                      +{{ section.items.length - 3 }} {{ t('profile.cvParser.more') }}
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
