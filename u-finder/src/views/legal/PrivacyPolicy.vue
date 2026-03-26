<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="min-h-svh bg-muted/30 px-3 py-6 sm:px-4 sm:py-8 md:px-8 md:py-12">
    <div class="mx-auto w-full max-w-4xl">
      <div class="mb-4 flex justify-end">
        <Button type="button" @click="router.push('/terms-of-service')">{{ t("legal.privacy.switchToTerms") }}</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle class="text-3xl font-bold">{{ t("legal.privacy.title") }}</CardTitle>
          <CardDescription>
            <strong>{{ t("legal.lastUpdatedLabel") }}</strong> {{ t("legal.lastUpdatedValue") }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6 text-left leading-7 text-sm md:text-base">
          <p>{{ t("legal.privacy.intro") }}</p>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.privacy.sections.informationWeCollect.title") }}</h2>
            <p>{{ t("legal.privacy.sections.informationWeCollect.body") }}</p>
            <ul class="list-disc space-y-1 pl-6">
              <li>{{ t("legal.privacy.sections.informationWeCollect.items.account") }}</li>
              <li>{{ t("legal.privacy.sections.informationWeCollect.items.profile") }}</li>
              <li>{{ t("legal.privacy.sections.informationWeCollect.items.education") }}</li>
              <li>{{ t("legal.privacy.sections.informationWeCollect.items.academic") }}</li>
              <li>{{ t("legal.privacy.sections.informationWeCollect.items.internshipAndProject") }}</li>
              <li>{{ t("legal.privacy.sections.informationWeCollect.items.cv") }}</li>
              <li>{{ t("legal.privacy.sections.informationWeCollect.items.favorites") }}</li>
              <li>{{ t("legal.privacy.sections.informationWeCollect.items.chat") }}</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.privacy.sections.howWeUse.title") }}</h2>
            <p>{{ t("legal.privacy.sections.howWeUse.body") }}</p>
            <ul class="list-disc space-y-1 pl-6">
              <li>{{ t("legal.privacy.sections.howWeUse.items.recommendations") }}</li>
              <li>{{ t("legal.privacy.sections.howWeUse.items.aiImprovement") }}</li>
              <li>{{ t("legal.privacy.sections.howWeUse.items.profileManagement") }}</li>
              <li>{{ t("legal.privacy.sections.howWeUse.items.cvParsing") }}</li>
              <li>{{ t("legal.privacy.sections.howWeUse.items.platformImprovement") }}</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.privacy.sections.aiProcessing.title") }}</h2>
            <p>{{ t("legal.privacy.sections.aiProcessing.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.privacy.sections.dataStorage.title") }}</h2>
            <p>{{ t("legal.privacy.sections.dataStorage.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.privacy.sections.dataSecurity.title") }}</h2>
            <p>{{ t("legal.privacy.sections.dataSecurity.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.privacy.sections.dataSharing.title") }}</h2>
            <p>{{ t("legal.privacy.sections.dataSharing.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.privacy.sections.userControl.title") }}</h2>
            <p>{{ t("legal.privacy.sections.userControl.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.privacy.sections.uploadedDocuments.title") }}</h2>
            <p>{{ t("legal.privacy.sections.uploadedDocuments.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.privacy.sections.changesToPolicy.title") }}</h2>
            <p>{{ t("legal.privacy.sections.changesToPolicy.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.privacy.sections.contact.title") }}</h2>
            <p>{{ t("legal.privacy.sections.contact.body") }}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
