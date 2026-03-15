<script lang="ts">
export const description
  = "A sidebar that collapses to icons."
export const iframeHeight = "800px"
export const containerClass = "w-full h-full"
</script>

<script setup lang="ts">
import { ref, provide } from 'vue'
import AppSidebar from "@/components/Sidebar/AppSidebar.vue"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useFavouriteStore } from "@/stores/favouriteStore"

useFavouriteStore().startStorageSync()

const sidebarRef = ref<InstanceType<typeof AppSidebar>>()

// Provide function to add new conversation locally
provide('addNewConversation', (conversationId: string) => {
  sidebarRef.value?.addNewConversation(conversationId)
})
</script>

<template>
  <SidebarProvider class="h-dvh">
    <AppSidebar ref="sidebarRef" />
    <SidebarInset>
      <div class="h-full min-h-0 flex-1 overflow-y-auto overscroll-none">
        <div class="mx-auto w-full max-w-screen-2xl px-8">
          <router-view />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
