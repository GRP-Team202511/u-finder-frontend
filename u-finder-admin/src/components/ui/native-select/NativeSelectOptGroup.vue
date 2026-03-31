<!-- 
Derived from shadcn-vue.
Source: https://github.com/unovue/shadcn-vue
License: MIT
-->
<!-- @fallthroughAttributes true -->
<!-- @strictTemplates true -->

<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <optgroup :class="cn('bg-popover text-popover-foreground', props.class)">
    <slot />
  </optgroup>
</template>
