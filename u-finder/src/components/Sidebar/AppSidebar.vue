<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar"

import {
  MessageCircle,
  Star,
  Clock,
  User,
} from "lucide-vue-next"
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

const props = defineProps<SidebarProps>()

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      titleKey: "sidebar.aiChat",
      to: { name: 'Cover' }, // to be updated when the page is being developed
      icon: MessageCircle,
    },
    {
      titleKey: "sidebar.favourite",
      to: { name: 'Cover' }, // to be updated when the page is being developed
      icon: Star,
    },
    {
      titleKey: "sidebar.history",
      to: { name: 'Cover' }, // to be updated when the page is being developed
      icon: Clock,
    },
    {
      titleKey: "sidebar.profile",
      to: { name: 'UserProfile' },
      icon: User,
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props" collapsible="icon">
    <SidebarHeader class="px-3 py-2 flex items-start justify-between">
      <div class="flex items-center">
        <SidebarTrigger />
      </div>
    </SidebarHeader>

    <SidebarContent>
      <div class="pt-20 pl-1">
        <NavMain :items="data.navMain" />
      </div>
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
