<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LayoutDashboard } from 'lucide-vue-next'

const { t } = useI18n()

</script>

<template>
    <div class="flex h-full flex-col gap-6 p-6">
        <!-- Page Header -->
        <div class="flex items-center gap-3">
            <LayoutDashboard class="size-8 text-primary" />
            <h1 class="text-3xl font-bold">{{ t('dashboard.title') }}</h1>
        </div>
    </div>
</template>