import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAdminStore } from '@/stores/adminStore'


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const userStore = useAdminStore()
      return userStore.isLoggedIn ? { name: 'Dashboard' } : { name: 'Login' }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {  
    path: '/login/reset',
    name: 'ResetPassword',
    component: () => import('../views/auth/Reset.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/app',
    component: () => import('../views/SidebarLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/Dashboard.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/settings/Settings.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return { el: to.hash, top: 0 }
    }

    return { top: 0 }
  }
})

// Navigation guard to check authentication
router.beforeEach((to, _from, next) => {
  const adminStore = useAdminStore()
  const requiresAuth = to.meta.requiresAuth
  const guestOnly = to.meta.guestOnly

  if (requiresAuth && !adminStore.isLoggedIn) {
    // Redirect to login page if not authenticated
    next({ name: 'Login' })
  } else if (guestOnly && adminStore.isLoggedIn) {
    // Redirect to home if already logged in and trying to access guest-only pages
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router