<script lang="ts">
export const description
  = "A sidebar that collapses to icons."
export const iframeHeight = "800px"
export const containerClass = "w-full h-full"
</script>

<script setup lang="ts">
import AppSidebar from "@/components/Sidebar/AppSidebar.vue"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
</script>

<template>
  <SidebarProvider class="h-dvh">
    <AppSidebar />
    <SidebarInset>
      <div class="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 pt-0">
        <div class="flex min-h-0 flex-1">
          <router-view />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
