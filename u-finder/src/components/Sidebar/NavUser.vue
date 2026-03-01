<script setup lang="ts">
import {
  ChevronsUpDown,
  Settings,
  LogOut,
} from "lucide-vue-next"

import { useI18n } from 'vue-i18n'

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

const props = defineProps<{
  user: {
    name: string | undefined
    // email: string
    avatar: string
  }
}>()
const { isMobile } = useSidebar()
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

const handleLogout = async () => {
  try {
    await logoutUser()
  } catch {
    // Clear local state regardless of server response
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
            <RouterLink :to="{ name: 'Cover' }"> <!--to be updated when the page is being developed-->
              <Settings />
              {{ t('sidebar.settings') }}
            </RouterLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="handleLogout">
          <LogOut />
          {{ t('sidebar.logout') }}
        </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
