// This code was completed by GRP Team 2025.11.
import type { Ref } from 'vue'

export interface EditorRegistration {
  save: () => void
  cancel?: () => void
  isEditing: Ref<boolean>
  isSaving?: Ref<boolean>
  el?: Ref<HTMLElement | null>
}

export interface ProfileEditor {
  register: (handler: EditorRegistration) => () => void
  setActiveEl: (el: HTMLElement | null) => void
}
