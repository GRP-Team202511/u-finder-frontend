<!-- 
Derived from shadcn-vue.
Source: https://github.com/unovue/shadcn-vue
License: MIT
-->
<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Separator } from '@/components/ui/separator'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <Separator
    data-slot="sidebar-separator"
    data-sidebar="separator"
    :class="cn('bg-sidebar-border mx-2 w-[calc(100%-theme(spacing.4))]', props.class)"
  >
    <slot />
  </Separator>
</template>
