<!-- This code was completed by GRP Team 2025.11. -->
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
        <Button type="button" @click="router.push('/privacy-policy')">{{ t("legal.terms.switchToPrivacy") }}</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle class="text-3xl font-bold">{{ t("legal.terms.title") }}</CardTitle>
          <CardDescription>
            <strong>{{ t("legal.lastUpdatedLabel") }}</strong> {{ t("legal.lastUpdatedValue") }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6 text-left leading-7 text-sm md:text-base">
          <p>{{ t("legal.terms.intro") }}</p>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.terms.sections.descriptionOfService.title") }}</h2>
            <p>{{ t("legal.terms.sections.descriptionOfService.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.terms.sections.userAccounts.title") }}</h2>
            <p>{{ t("legal.terms.sections.userAccounts.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.terms.sections.userInformation.title") }}</h2>
            <p>{{ t("legal.terms.sections.userInformation.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.terms.sections.aiRecommendations.title") }}</h2>
            <p>{{ t("legal.terms.sections.aiRecommendations.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.terms.sections.cvUploadAndParsing.title") }}</h2>
            <p>{{ t("legal.terms.sections.cvUploadAndParsing.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.terms.sections.acceptableUse.title") }}</h2>
            <p>{{ t("legal.terms.sections.acceptableUse.body") }}</p>
            <ul class="list-disc space-y-1 pl-6">
              <li>{{ t("legal.terms.sections.acceptableUse.items.unauthorizedAccess") }}</li>
              <li>{{ t("legal.terms.sections.acceptableUse.items.maliciousContent") }}</li>
              <li>{{ t("legal.terms.sections.acceptableUse.items.unlawfulUse") }}</li>
              <li>{{ t("legal.terms.sections.acceptableUse.items.systemDisruption") }}</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.terms.sections.savedUniversities.title") }}</h2>
            <p>{{ t("legal.terms.sections.savedUniversities.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.terms.sections.limitationOfLiability.title") }}</h2>
            <p>{{ t("legal.terms.sections.limitationOfLiability.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.terms.sections.changesToService.title") }}</h2>
            <p>{{ t("legal.terms.sections.changesToService.body") }}</p>
          </section>

          <section class="space-y-2">
            <h2 class="text-xl font-semibold">{{ t("legal.terms.sections.contact.title") }}</h2>
            <p>{{ t("legal.terms.sections.contact.body") }}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
