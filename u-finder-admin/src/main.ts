import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import piniaPersist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPersist)

createApp(App).use(pinia).use(router).use(i18n).mount('#app')

