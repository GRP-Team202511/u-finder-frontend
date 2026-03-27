<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { SidebarProps } from "@/components/ui/sidebar"
import { LayoutDashboard } from "lucide-vue-next"
import NavMain from "@/components/Sidebar/NavMain.vue"
import NavUser from "@/components/Sidebar/NavUser.vue"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAdminStore } from "@/stores/adminStore"
import { getAvatar } from "@/api/adminApi"

const props = defineProps<SidebarProps>()
const adminStore = useAdminStore()

const user = computed(() => ({
  name: adminStore.admin?.name,
  avatar: adminStore.avatarUrl || '',
}))

// Fetch avatar on sidebar mount if not already cached in store
onMounted(async () => {
  if (!adminStore.avatarUrl && adminStore.isLoggedIn) {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || ''
      const response = await getAvatar('256x256')
      if (response.data.url) {
        adminStore.setAvatar(`${baseUrl}${response.data.url}`)
      }
    } catch {
      // No avatar available
    }
  }
})

const navMain = [
  {
    titleKey: "sidebar.dashboard",
    to: { name: 'Dashboard' },
    icon: LayoutDashboard,
  },
]
</script>

<template>
  <Sidebar v-bind="props" collapsible="icon">
    <SidebarHeader class="px-3 py-2">
      <SidebarTrigger />
    </SidebarHeader>

    <SidebarContent class="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div class="pt-4">
        <NavMain :items="navMain" />
      </div>
    </SidebarContent>

    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
