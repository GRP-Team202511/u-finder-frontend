<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import AccountSettings from '@/components/Settings/AccountSettings.vue'
import GeneralSettings from '@/components/Settings/GeneralSettings.vue'
import { User, Settings as SettingsIcon } from 'lucide-vue-next'

const { t } = useI18n()

// Default active tab
const activeTab = ref('account')
</script>

<template>
  <div class="flex h-full flex-col gap-6 p-6">
    <!-- Page Header -->
    <div class="flex items-center gap-3">
      <SettingsIcon class="size-8 text-primary" />
      <h1 class="text-3xl font-bold">{{ t('settings.title') }}</h1>
    </div>

    <!-- Settings Tabs -->
    <Tabs v-model="activeTab" class="flex-1">
      <TabsList class="w-full justify-start bg-muted/50 p-1">
        <TabsTrigger value="account" class="gap-2">
          <User class="size-4" />
          {{ t('settings.tabs.account') }}
        </TabsTrigger>
        <TabsTrigger value="general" class="gap-2">
          <SettingsIcon class="size-4" />
          {{ t('settings.tabs.general') }}
        </TabsTrigger>
      </TabsList>

      <!-- Account Settings Tab -->
      <TabsContent value="account" class="mt-6">
        <AccountSettings />
      </TabsContent>

      <!-- General Settings Tab -->
      <TabsContent value="general" class="mt-6">
        <GeneralSettings />
      </TabsContent>
    </Tabs>
  </div>
</template>