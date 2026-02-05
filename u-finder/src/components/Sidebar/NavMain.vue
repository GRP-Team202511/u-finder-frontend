<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { useI18n } from "vue-i18n"
import { useRoute, RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

function isItemActive(item: any) {
  if (item.isActive) return true
  if (item.to) {
    if (typeof item.to === 'string') return route.path === item.to
    if (typeof item.to === 'object' && item.to.name) return String(route.name) === String(item.to.name)
  }
  if (item.url) return route.path === item.url
  return false
}

defineProps<{
  items: {
    title?: string
    titleKey?: string
    url?: string
    to?: RouteLocationRaw
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title?: string
      titleKey?: string
      url?: string
      to?: RouteLocationRaw
    }[]
  }[]
}>()
</script>

<template>
  <SidebarGroup>
    <SidebarMenu>
      <template v-for="item in items" :key="item.title || item.titleKey">
        <Collapsible
          v-if="item.items"
          as-child
          :default-open="item.isActive"
          class="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :tooltip="item.title">
                <component :is="item.icon" v-if="item.icon" class="menu-icon" />
                <span class="menu-label">{{ item.titleKey ? t(item.titleKey) : item.title }}</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title || subItem.titleKey">
                  <SidebarMenuSubButton as-child>
                    <a :href="subItem.url">
                      <span>{{ subItem.titleKey ? t(subItem.titleKey) : subItem.title }}</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        <SidebarMenuItem v-else>
          <SidebarMenuButton as-child :tooltip="item.title" :isActive="isItemActive(item)">
            <RouterLink :to="item.to || item.url || '#'" class="flex items-center w-full">
              <component :is="item.icon" v-if="item.icon" class="menu-icon" />
              <span class="menu-label">{{ item.titleKey ? t(item.titleKey) : item.title }}</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
