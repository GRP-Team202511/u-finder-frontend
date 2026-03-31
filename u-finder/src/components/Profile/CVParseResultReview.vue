<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info, CircleHelp } from 'lucide-vue-next'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { CVParseResponse, CVImportSelections, ImportMode } from '@/types/profileTypes'

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
  (e: 'confirm', selections: CVImportSelections): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

// Local state
const isOpen = ref(props.open)
// itemSelections[sectionKey] = array of selected item indices within that section
const itemSelections = ref<Record<string, number[]>>({})
// importModes[sectionKey] = user-chosen import mode ('append' or 'overwrite') for each array section
const importModes = ref<Record<string, ImportMode>>({})

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

// Initialize item-level selections: pre-select all items in sections that have data
function initializeSelections() {
  if (!props.data) return
  const d = props.data
  const newSel: Record<string, number[]> = {}

  // personalInfo is a single object — treat as a one-element array internally
  newSel['personalInfo'] = hasPersonalInfo() ? [0] : []

  // Array-typed sections: pre-select every parsed item and default to 'append' mode
  const arraySections = ['education', 'academic', 'test', 'internship', 'project', 'campus', 'award'] as const
  const newModes: Record<string, ImportMode> = {}
  arraySections.forEach(key => {
    const count = d[key].data.length
    newSel[key] = Array.from({ length: count }, (_, i) => i)
    newModes[key] = 'append'
  })

  itemSelections.value = newSel
  importModes.value = newModes
}

// ─── Per-item selection helpers ──────────────────────────────────────────────

// Returns true if item at `idx` within `sectionKey` is currently selected
function isItemSelected(sectionKey: string, idx: number): boolean {
  return itemSelections.value[sectionKey]?.includes(idx) ?? false
}

// Returns tri-state check value for a section-level header checkbox
function getSectionCheckState(sectionKey: string): boolean | 'indeterminate' {
  const arr = itemSelections.value[sectionKey]
  const section = sectionsData.value.find(s => s.key === sectionKey)
  if (!arr || !section || section.items.length === 0) return false
  if (arr.length === 0) return false
  if (arr.length === section.items.length) return true
  return 'indeterminate'
}

// Toggle a single item on or off
function toggleItem(sectionKey: string, idx: number) {
  const arr = itemSelections.value[sectionKey]
  if (!arr) return
  const pos = arr.indexOf(idx)
  if (pos >= 0) {
    arr.splice(pos, 1)
  } else {
    arr.push(idx)
  }
}

// Select or deselect all items in a section at once
function toggleSection(sectionKey: string, checked: boolean | 'indeterminate') {
  const section = sectionsData.value.find(s => s.key === sectionKey)
  if (!section) return
  itemSelections.value[sectionKey] = checked === true
    ? section.items.map((_, i) => i)
    : []
}

// Toggle the expand / collapse state of a section's item list — kept for potential future use
// (currently replaced by scroll; left as dead code guard)

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
      title: t('info.title'),
      action: t('profile.cvParser.actions.overwrite'),
      hasData: hasPersonalInfo(),
      count: hasPersonalInfo() ? 1 : 0,
      preview: formatPersonalInfo(),
      items: hasPersonalInfo() ? [props.data.personalInfo] : [],
    },
    {
      key: 'education',
      title: t('edu.title'),
      action: t('profile.cvParser.actions.append'),
      hasData: props.data.education.data.length > 0,
      count: props.data.education.data.length,
      preview: formatEducation(),
      items: props.data.education.data,
    },
    {
      key: 'academic',
      title: t('academic.title'),
      action: t('profile.cvParser.actions.append'),
      hasData: props.data.academic.data.length > 0,
      count: props.data.academic.data.length,
      preview: formatAcademic(),
      items: props.data.academic.data,
    },
    {
      key: 'test',
      title: t('test.title'),
      action: t('profile.cvParser.actions.append'),
      hasData: props.data.test.data.length > 0,
      count: props.data.test.data.length,
      preview: formatTest(),
      items: props.data.test.data,
    },
    {
      key: 'internship',
      title: t('internship.title'),
      action: t('profile.cvParser.actions.append'),
      hasData: props.data.internship.data.length > 0,
      count: props.data.internship.data.length,
      preview: formatInternship(),
      items: props.data.internship.data,
    },
    {
      key: 'project',
      title: t('project.title'),
      action: t('profile.cvParser.actions.append'),
      hasData: props.data.project.data.length > 0,
      count: props.data.project.data.length,
      preview: formatProject(),
      items: props.data.project.data,
    },
    {
      key: 'campus',
      title: t('campusExp.title'),
      action: t('profile.cvParser.actions.append'),
      hasData: props.data.campus.data.length > 0,
      count: props.data.campus.data.length,
      preview: formatCampus(),
      items: props.data.campus.data,
    },
    {
      key: 'award',
      title: t('award.title'),
      action: t('profile.cvParser.actions.append'),
      hasData: props.data.award.data.length > 0,
      count: props.data.award.data.length,
      preview: formatAward(),
      items: props.data.award.data,
    },
  ]
})

// ─── Global select-all state ──────────────────────────────────────────────────

const allSelected = computed(() =>
  sectionsData.value
    .filter(s => s.hasData)
    .every(s => getSectionCheckState(s.key) === true)
)

const someItemSelected = computed(() =>
  sectionsData.value
    .filter(s => s.hasData)
    .some(s => (itemSelections.value[s.key]?.length ?? 0) > 0)
)

const selectAllChecked = computed<boolean | 'indeterminate'>(() => {
  if (allSelected.value) return true
  if (someItemSelected.value) return 'indeterminate'
  return false
})

// Format functions for preview
function formatPersonalInfo(): string[] {
  if (!props.data) return []
  const info = props.data.personalInfo
  const items: string[] = []
  if (info.name) items.push(`${t('info.name')}: ${info.name}`)
  if (info.gender) items.push(`${t('info.gender.title')}: ${info.gender}`)
  if (info.birthday) items.push(`${t('info.birthday')}: ${info.birthday}`)
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
      return `${t('academic.paper')}: ${item.title}`
    } else {
      return `${t('academic.patent')}: ${item.title}`
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

// Toggle every selectable item across all sections
function toggleAll(checked: boolean | 'indeterminate') {
  sectionsData.value
    .filter(s => s.hasData)
    .forEach(s => toggleSection(s.key, checked))
}

// Set all array sections (excluding personalInfo) to the same import mode at once
function setAllModes(mode: ImportMode) {
  const arraySections = ['education', 'academic', 'test', 'internship', 'project', 'campus', 'award'] as const
  arraySections.forEach(key => {
    importModes.value[key] = mode
  })
}

// Reflects whether all array sections currently share a single mode, or are mixed
const globalModeState = computed<ImportMode | 'mixed'>(() => {
  const arraySections = ['education', 'academic', 'test', 'internship', 'project', 'campus', 'award']
  const modes = arraySections.map(k => importModes.value[k] ?? 'append')
  if (modes.every(m => m === 'append')) return 'append'
  if (modes.every(m => m === 'overwrite')) return 'overwrite'
  return 'mixed'
})

// Build CVImportSelections from current item-level selections and emit
function confirmSelection() {
  if (!props.data) return
  const d = props.data
  const sel = itemSelections.value

  const result: CVImportSelections = {
    personalInfo: (sel['personalInfo']?.length ?? 0) > 0,
    // Indices are always valid (set from initializeSelections / toggleItem), so undefined is impossible;
    // the filter removes the undefined from the type so TypeScript is satisfied.
    education:  { mode: importModes.value['education']  ?? 'append', items: (sel['education']  || []).map(i => d.education.data[i]).filter((x): x is NonNullable<typeof x> => x !== undefined) },
    academic:   { mode: importModes.value['academic']   ?? 'append', items: (sel['academic']   || []).map(i => d.academic.data[i]).filter((x): x is NonNullable<typeof x> => x !== undefined) },
    test:       { mode: importModes.value['test']       ?? 'append', items: (sel['test']       || []).map(i => d.test.data[i]).filter((x): x is NonNullable<typeof x> => x !== undefined) },
    internship: { mode: importModes.value['internship'] ?? 'append', items: (sel['internship'] || []).map(i => d.internship.data[i]).filter((x): x is NonNullable<typeof x> => x !== undefined) },
    project:    { mode: importModes.value['project']    ?? 'append', items: (sel['project']    || []).map(i => d.project.data[i]).filter((x): x is NonNullable<typeof x> => x !== undefined) },
    campus:     { mode: importModes.value['campus']     ?? 'append', items: (sel['campus']     || []).map(i => d.campus.data[i]).filter((x): x is NonNullable<typeof x> => x !== undefined) },
    award:      { mode: importModes.value['award']      ?? 'append', items: (sel['award']      || []).map(i => d.award.data[i]).filter((x): x is NonNullable<typeof x> => x !== undefined) },
  }

  emit('confirm', result)
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
    if (item.name) details.push({ label: t('info.name'), value: item.name })
    if (item.gender) details.push({ label: t('info.gender.title'), value: item.gender })
    if (item.birthday) details.push({ label: t('info.birthday'), value: item.birthday })
  } else if (sectionKey === 'education') {
    details.push({ label: t('edu.type'), value: item.type })
    details.push({ label: t('edu.institution'), value: item.name })
    details.push({ label: t('edu.major'), value: item.major })
    details.push({ label: t('edu.time.start'), value: item.time.start })
    details.push({ label: t('edu.time.end'), value: item.time.end })
    if (item.ranking) details.push({ label: t('edu.ranking'), value: item.ranking })
    details.push({ label: t('edu.GPA'), value: `${item.GPA} / ${item['GPA-base']}` })
  } else if (sectionKey === 'academic') {
    if (item.type === 'research paper') {
      details.push({ label: t('academic.type.title'), value: t('academic.type.researchPaper') })
      details.push({ label: t('academic.researchPaper.title'), value: item.title })
      if (item.doi) details.push({ label: t('academic.researchPaper.doi'), value: item.doi })
      if (item.abstract) details.push({ label: t('academic.researchPaper.abstract'), value: item.abstract })
    } else {
      details.push({ label: t('academic.type.title'), value: t('academic.type.patent') })
      details.push({ label: t('academic.patent.title'), value: item.title })
      if (item.patentNumber) details.push({ label: t('academic.patent.number'), value: item.patentNumber })
      if (item.region) details.push({ label: t('academic.patent.region'), value: item.region })
      if (item.description) details.push({ label: t('academic.patent.description'), value: item.description })
    }
  } else if (sectionKey === 'test') {
    details.push({ label: t('test.type'), value: item.type })
    if (item.test_date) {
      details.push({ label: t('test.testDate'), value: item.test_date })
    }
    // Add scores
    Object.entries(item.scores).forEach(([key, value]) => {
      if (value && value !== '') {
        details.push({ label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value: String(value) })
      }
    })
  } else if (sectionKey === 'internship') {
    details.push({ label: t('internship.company'), value: item.company })
    details.push({ label: t('internship.role'), value: item.role })
    details.push({ label: t('internship.time.start'), value: item.time.start })
    details.push({ label: t('internship.time.end'), value: item.time.end })
    if (item.time.till_now) details.push({ label: '', value: t('internship.time.till now') })
    if (item.description) details.push({ label: t('internship.description'), value: item.description })
  } else if (sectionKey === 'project') {
    details.push({ label: t('project.name'), value: item.name })
    details.push({ label: t('project.role'), value: item.role })
    details.push({ label: t('project.time.start'), value: item.time.start })
    details.push({ label: t('project.time.end'), value: item.time.end })
    if (item.time.till_now) details.push({ label: '', value: t('project.time.till now') })
    if (item.description) details.push({ label: t('project.description'), value: item.description })
  } else if (sectionKey === 'campus') {
    details.push({ label: t('campusExp.name'), value: item.name })
    if (item.description) details.push({ label: t('campusExp.description'), value: item.description })
  } else if (sectionKey === 'award') {
    details.push({ label: t('award.name'), value: item.name })
    if (item.description) details.push({ label: t('award.description'), value: item.description })
  }
  
  return details
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-200 max-h-[85vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>{{ t('profile.cvParser.reviewTitle') }}</DialogTitle>
        <DialogDescription>
          {{ t('profile.cvParser.reviewDescription') }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto py-4">
        <!-- Select All Checkbox + global import-mode toggle -->
        <div class="flex items-center justify-between gap-4 mb-4 pb-4 border-b">
          <div class="flex items-center space-x-2">
            <Checkbox
              :id="'select-all'"
              :model-value="selectAllChecked"
              @update:model-value="toggleAll"
            />
            <Label
              :for="'select-all'"
              class="text-sm font-medium cursor-pointer"
            >
              {{ t('profile.cvParser.selectAll') }}
            </Label>
          </div>
          <!-- Global mode toggle: sets all array sections to append or overwrite at once -->
          <div class="flex shrink-0 items-center gap-2">
            <span class="text-xs text-muted-foreground">{{ t('profile.cvParser.allSections') }}:</span>
            <!-- Help tooltip: explains what append and overwrite mean -->
            <TooltipProvider :delay-duration="100">
              <Tooltip>
                <TooltipTrigger as-child>
                  <button type="button" class="text-muted-foreground hover:text-foreground transition-colors" tabindex="-1">
                    <CircleHelp class="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" class="max-w-56 text-xs leading-relaxed">
                  <p><strong>{{ t('profile.cvParser.importModeAppend') }}</strong>: {{ t('profile.cvParser.importModeAppendDesc') }}</p>
                  <p class="mt-1"><strong>{{ t('profile.cvParser.importModeOverwrite') }}</strong>: {{ t('profile.cvParser.importModeOverwriteDesc') }}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div class="flex rounded-md border overflow-hidden text-xs">
              <button
                type="button"
                class="px-2.5 py-1 transition-colors"
                :class="globalModeState === 'append'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'"
                @click="setAllModes('append')"
              >
                {{ t('profile.cvParser.importModeAppend') }}
              </button>
              <button
                type="button"
                class="px-2.5 py-1 transition-colors border-l"
                :class="globalModeState === 'overwrite'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'"
                @click="setAllModes('overwrite')"
              >
                {{ t('profile.cvParser.importModeOverwrite') }}
              </button>
            </div>
          </div>
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
                    <div class="flex items-center space-x-2 flex-1 min-w-0">
                      <Checkbox
                        :id="`select-${section.key}`"
                        :model-value="getSectionCheckState(section.key)"
                        :disabled="!section.hasData"
                        class="mt-0.5 shrink-0"
                        @update:model-value="(v) => toggleSection(section.key, v)"
                      />
                      <div class="flex-1 min-w-0">
                        <Label
                          :for="`select-${section.key}`"
                          class="text-base font-semibold cursor-pointer leading-none"
                        >
                          {{ section.title }}
                        </Label>
                        <div class="flex items-center gap-2 mt-1.5">
                          <span class="text-sm text-muted-foreground">
                            {{ section.count }} {{ section.count === 1 ? t('profile.cvParser.item') : t('profile.cvParser.items') }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <!-- Import mode toggle: only shown for array sections (personalInfo is always overwrite) -->
                    <div
                      v-if="section.key !== 'personalInfo' && section.hasData"
                      class="flex shrink-0 rounded-md border overflow-hidden text-xs"
                    >
                      <button
                        type="button"
                        class="px-2 py-1 transition-colors"
                        :class="(importModes[section.key] ?? 'append') === 'append'
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground'"
                        @click="importModes[section.key] = 'append'"
                      >
                        {{ t('profile.cvParser.importModeAppend') }}
                      </button>
                      <button
                        type="button"
                        class="px-2 py-1 transition-colors border-l"
                        :class="importModes[section.key] === 'overwrite'
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground'"
                        @click="importModes[section.key] = 'overwrite'"
                      >
                        {{ t('profile.cvParser.importModeOverwrite') }}
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="pt-0">
                  <div v-if="section.hasData">
                    <!-- Scrollable item list: fixed height shows ~3 rows; excess items are reachable by scrolling -->
                    <div
                      class="space-y-1 overflow-y-auto"
                      :class="section.items.length > 3 ? 'max-h-34' : ''"
                    >
                      <!-- One row per item: individual checkbox + summary text + detail popover -->
                      <div
                        v-for="(item, idx) in section.items"
                        :key="idx"
                        class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          :id="`item-${section.key}-${idx}`"
                          :model-value="isItemSelected(section.key, idx)"
                          class="shrink-0"
                          @update:model-value="() => toggleItem(section.key, idx)"
                        />
                        <span class="truncate flex-1 text-sm text-muted-foreground select-none">
                          {{ section.preview[idx] }}
                        </span>
                        <!-- Detail popover: click the info icon to inspect the full item -->
                        <Popover>
                          <PopoverTrigger as-child>
                            <button
                              type="button"
                              class="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Info class="h-3.5 w-3.5" />
                            </button>
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
                      </div>
                    </div>
                    <!-- Scroll hint shown only when there are more than 3 items -->
                    <p
                      v-if="section.items.length > 3"
                      class="mt-1.5 text-center text-xs text-muted-foreground/70 italic"
                    >
                      {{ t('profile.cvParser.scrollHint') }}
                    </p>
                  </div>
                  <p v-else class="text-sm text-muted-foreground italic">
                    {{ t('profile.cvParser.noData') }}
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
          {{ t('profile.cancel') }}
        </Button>
        <Button 
          @click="confirmSelection"
          :disabled="!someItemSelected"
        >
          {{ t('profile.cvParser.confirmImport') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
