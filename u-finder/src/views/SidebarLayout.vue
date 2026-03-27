<script lang="ts">
export const description
  = "A sidebar that collapses to icons."
export const iframeHeight = "800px"
export const containerClass = "w-full h-full"
</script>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import AppSidebar from "@/components/Sidebar/AppSidebar.vue"
import MobileSidebarToggle from '@/components/Sidebar/MobileSidebarToggle.vue'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useFavouriteStore } from "@/stores/favouriteStore"

useFavouriteStore().startStorageSync()
const { t } = useI18n()

const sidebarRef = ref<InstanceType<typeof AppSidebar>>()

// Provide function to add new conversation locally
provide('addNewConversation', (conversationId: string) => {
  sidebarRef.value?.addNewConversation(conversationId)
})
</script>

<template>
  <SidebarProvider class="h-dvh">
    <AppSidebar ref="sidebarRef" />
    <header class="fixed top-0 right-0 left-0 z-[5] border-b bg-background/95 backdrop-blur transition-[left] duration-200 ease-linear md:left-[var(--sidebar-width)] md:peer-data-[state=collapsed]:left-[var(--sidebar-width-icon)]">
      <div class="flex h-12 w-full items-center gap-3 px-3 sm:px-4">
        <MobileSidebarToggle />
        <span class="text-sm font-semibold tracking-wide">{{ t('sidebar.appName') }}</span>
      </div>
    </header>
    <SidebarInset>
      <div class="mt-12 h-[calc(100dvh-3rem)] min-h-0 flex-1 overflow-y-auto overscroll-none">
        <div class="mx-auto flex h-full min-h-0 w-full max-w-screen-2xl flex-col px-3 sm:px-4 lg:px-8">
          <router-view />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
