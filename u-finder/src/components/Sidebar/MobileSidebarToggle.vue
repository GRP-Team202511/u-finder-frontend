<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { AlignJustify } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'

const { isMobile, toggleSidebar } = useSidebar()
</script>

<template>
  <Button
    v-if="isMobile"
    type="button"
    variant="ghost"
    size="icon"
    class="h-9 w-9 bg-background/85 md:hidden"
    @click="toggleSidebar"
  >
    <AlignJustify class="size-5" />
    <span class="sr-only">Open sidebar</span>
  </Button>
</template>