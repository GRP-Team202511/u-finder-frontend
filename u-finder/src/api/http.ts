import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const BASE_URL = import.meta.env.VITE_BASE_URL

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
})

// request interceptor
http.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    if (userStore.user?.token) {
      config.headers.Authorization = `Bearer ${userStore.user.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// response interceptor
http.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // token expired
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
    }
    return Promise.reject(error)
  }
)

export default http