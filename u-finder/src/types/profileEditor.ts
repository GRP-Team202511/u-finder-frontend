import type { Ref } from 'vue'

export interface EditorRegistration {
  save: () => void
  cancel?: () => void
  isEditing: Ref<boolean>
  el?: Ref<HTMLElement | null>
}

export interface ProfileEditor {
  register: (handler: EditorRegistration) => () => void
  setActiveEl: (el: HTMLElement | null) => void
}
