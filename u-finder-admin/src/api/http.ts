import axios from 'axios'
import { useAdminStore } from '@/stores/adminStore'
import router from '@/router'
import { toast } from 'vue-sonner'
import { t } from '@/i18n'

const BASE_URL = import.meta.env.VITE_BASE_URL

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
})

let isHandlingUnauthorized = false

// request interceptor
http.interceptors.request.use(
  (config) => {
    const adminStore = useAdminStore()

    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as any
    }

    if (adminStore.admin?.token) {
      config.headers.Authorization = `Bearer ${adminStore.admin.token}`
    }
    config.headers['User-Agent'] = window?.navigator?.userAgent ?? 'unknown'
    return config
  },
  (error) => Promise.reject(error)
)

// response interceptor
http.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    // token expired
    if (error.response?.status === 401) {
      const adminStore = useAdminStore()
      const hadToken = !!adminStore.admin?.token
      adminStore.logout()

      if (hadToken && !isHandlingUnauthorized) {
        isHandlingUnauthorized = true
        try {
          toast.error(t('common.errors.sessionExpired'))

          const currentRoute = router.currentRoute.value
          const isAuthPage = ['Login', 'ResetPassword'].includes(String(currentRoute.name ?? ''))

          if (!isAuthPage) {
            await router.replace({
              name: 'Login',
              query: { redirect: currentRoute.fullPath },
            })
          }
        } finally {
          isHandlingUnauthorized = false
        }
      }
    }
    return Promise.reject(error)
  }
)

export default http