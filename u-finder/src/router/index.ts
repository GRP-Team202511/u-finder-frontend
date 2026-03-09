import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const userStore = useUserStore()
      return userStore.isLoggedIn ? { name: 'UserProfile' } : { name: 'Cover' }
    }
  },
  {
    path: '/cover',
    name: 'Cover',
    component: () => import('../views/Cover.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/auth/Signup.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {  
    path: '/login/reset',
    name: 'ResetPassword',
    component: () => import('../views/auth/Reset.vue'),
    meta: { requiresAuth: false }
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
        path: 'aichat/:conversationId?',
        name: 'AIChat',
        component: () => import('../views/chat/AIChat.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !userStore.isLoggedIn) {
    // Redirect to cover page if not authenticated
    next({ name: 'Cover' })
  } else if (!requiresAuth && userStore.isLoggedIn) {
    // Redirect to home if already logged in and trying to access login/signup
    next({ name: 'UserProfile' })
  } else {
    next()
  }
})

export default router
