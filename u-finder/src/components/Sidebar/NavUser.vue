<script setup lang="ts">
import {
  ChevronsUpDown,
  Settings,
  LogOut,
  Languages,
  Check,
} from "lucide-vue-next"

import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, RouterLink } from 'vue-router'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useUserStore } from '@/stores/userStore'
import { logoutUser } from '@/api/userApi'
import { toast } from 'vue-sonner'

const props = defineProps<{
  user: {
    name: string | undefined
    // email: string
    avatar: string
  }
}>()
const { isMobile } = useSidebar()
const router = useRouter()
const { t, locale } = useI18n()
const userStore = useUserStore()

// Load saved language from localStorage on component mount
const savedLang = localStorage.getItem('preferred-language')
if (savedLang && ['en', 'zh-CN', 'zh-TW'].includes(savedLang)) {
  locale.value = savedLang as 'en' | 'zh-CN' | 'zh-TW'
}

const languages = [
  {
    code: 'en' as const,
    name: 'English'
  },
  {
    code: 'zh-CN' as const,
    name: '简体中文'
  },
  {
    code: 'zh-TW' as const,
    name: '繁體中文'
  }
]

const currentLocale = computed(() => locale.value)

const switchLanguage = (langCode: string) => {
  if (['en', 'zh-CN', 'zh-TW'].includes(langCode)) {
    locale.value = langCode as 'en' | 'zh-CN' | 'zh-TW'
    localStorage.setItem('preferred-language', langCode)
  }
}

const handleLogout = async () => {
  try {
    await logoutUser()
  } catch (error: any) {
    const status = error?.response?.status
    if (status === 401) {
      console.log('Logout unauthorized')
      toast.error(t('sidebar.logoutUnauthorized'))
    } else if (status === 500) {
      console.log('Logout server error')
      toast.error(t('sidebar.logoutServerError'))
    } else {
      console.log('Logout failed')
      toast.error(t('sidebar.logoutFailed'))
    }
  } finally {
    userStore.logout()
    router.push({ name: 'Login' })
  }
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg menu-icon">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg">
                CN
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight menu-label">
              <span class="truncate font-medium">{{ user.name }}</span>
              <!-- <span class="truncate text-xs">{{ user.email }}</span> -->
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
        <DropdownMenuLabel class="p-0 font-normal">
          <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg">
                CN
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight menu-label">
              <span class="truncate font-semibold">{{ user.name }}</span>
              <!-- <span class="truncate text-xs">{{ user.email }}</span> -->
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem as-child>
            <RouterLink :to="{ name: 'Settings' }">
              <Settings class="size-4" />
              {{ t('sidebar.settings') }}
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger class="gap-2">
              <Languages class="size-4" />
              {{ t('sidebar.language') }}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem 
                v-for="lang in languages" 
                :key="lang.code"
                @click="switchLanguage(lang.code)"
                class="cursor-pointer"
              >
                <Check 
                  class="size-4 mr-2" 
                  :class="currentLocale === lang.code ? 'opacity-100' : 'opacity-0'"
                />
                {{ lang.name }}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="handleLogout">
          <LogOut class="size-4" />
          {{ t('sidebar.logout') }}
        </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
