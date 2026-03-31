<!-- This code was completed by GRP Team 2025.11. -->
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

const sidebarRef = ref<InstanceType<typeof AppSidebar>>()

</script>

<template>
  <SidebarProvider class="h-dvh">
    <AppSidebar ref="sidebarRef" />
    <SidebarInset>
      <div class="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-auto bg-[#f5f5f5] p-4 pt-0 dark:bg-background">
        <router-view />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>