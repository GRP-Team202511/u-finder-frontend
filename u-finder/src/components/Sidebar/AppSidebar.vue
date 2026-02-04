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
      url: "#",
      icon: MessageCircle,
    },
    {
      titleKey: "sidebar.favourite",
      url: "#",
      icon: Star,
    },
    {
      titleKey: "sidebar.history.title",
      url: "#",
      icon: Clock,
      isActive: true,
      items: [
        {
          titleKey: "sidebar.history.session1",
          url: "#",
        },
        {
          titleKey: "sidebar.history.session2",
          url: "#",
        },
        {
          titleKey: "sidebar.history.session3",
          url: "#",
        },
      ],
    },
    {
      titleKey: "sidebar.profile",
      url: "#",
      icon: User,
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarContent class="pt-2, pl-2">
      <div class="pt-20">
        <NavMain :items="data.navMain" />
      </div>
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
