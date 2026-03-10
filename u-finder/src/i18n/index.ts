import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'

type MessageSchema = typeof en

const i18n = createI18n<[MessageSchema], 'en' | 'zh-CN' | 'zh-TW'>({
  legacy: false,
  locale: 'en', 
  fallbackLocale: 'en',
  messages: {
    'en': en,
    'zh-CN': zhCN as any,
    'zh-TW': zhTW as any
  }
})

export default i18n

// Export a typed t function for use outside Vue components
export const t = (key: string): string => {
  const translation = i18n.global.t(key)
  return typeof translation === 'string' ? translation : String(translation)
}