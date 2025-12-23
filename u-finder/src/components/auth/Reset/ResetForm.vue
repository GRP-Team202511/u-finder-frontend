<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref } from 'vue'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useI18n } from 'vue-i18n'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Toaster, toast } from 'vue-sonner'
import http from "@/api/http"
import { useUserStore } from "@/stores/userStore"
import { useRouter } from "vue-router"

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const sendOTP = async() => {

}
</script>

<template>
  <Toaster />
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
          <CardTitle class="text-3xl font-bold">
            {{ t("login.reset.title") }}
          </CardTitle>
          <CardDescription>
            {{ t("login.reset.description") }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel for="email">
                  {{ t("login.email") }}
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  required
                />
              </Field>
              <Field>
                <FieldLabel for="password">
                  {{ t("login.password") }}
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                />
              </Field>
              <Field>
                <FieldLabel for="otp">
                  {{ t("login.reset.otp") }}
                </FieldLabel>
                <div class="flex w-full max-w-sm items-center space-x-2">
                  <Input />
                  <Button @click="sendOTP">
                    {{ t("login.reset.sendCode") }}
                  </Button>
                </div>
              </Field>
              <FieldSeparator />
              <Field>
                <Button type="submit">
                  {{ t("login.reset.send") }}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
    </Card>
  </div>
</template>