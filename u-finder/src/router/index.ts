import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const userStore = useUserStore()
      return userStore.isLoggedIn ? { name: 'AIChat', query: { new: '1' } } : { name: 'Cover' }
    }
  },
  {
    path: '/cover',
    name: 'Cover',
    component: () => import('../views/Cover.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/auth/Signup.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: () => import('../views/legal/TermsOfService.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('../views/legal/PrivacyPolicy.vue'),
    meta: { requiresAuth: false }
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
        path: 'userprofile',
        name: 'UserProfile',
        component: () => import('../views/profile/UserProfile.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'aichat',
        name: 'AIChat',
        component: () => import('../views/chat/AIChat.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'favourite',
        name: 'Favourite',
        component: () => import('../views/favourite/Favourite.vue'),
        meta: { requiresAuth: true }
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
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth
  const guestOnly = to.meta.guestOnly

  if (requiresAuth && !userStore.isLoggedIn) {
    // Redirect to cover page if not authenticated
    next({ name: 'Cover' })
  } else if (guestOnly && userStore.isLoggedIn) {
    // Redirect to AI Chat if already logged in and trying to access guest-only pages
    next({ name: 'AIChat', query: { new: '1' } })
  } else {
    next()
  }
})

export default router
