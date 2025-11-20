<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

const { t } = useI18n()

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card  >
      <CardHeader class="text-center">
        <CardTitle class="text-3xl font-bold">
          {{ t("signup.title") }}
        </CardTitle>
        <CardDescription>
          {{ t("signup.description") }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel for="username">{{ t("signup.username") }}</FieldLabel>
              <Input id="username" type="text" placeholder="John Doe" required />
            </Field>

            <Field>
              <FieldLabel for="email">{{ t("signup.email") }}</FieldLabel>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </Field>

            <Field>
              <FieldLabel for="password">{{ t("signup.password") }}</FieldLabel>
              <Input id="password" type="password" required />
            </Field>

            <Field>
              <FieldLabel for="confirm-password">{{ t("signup.confirmPassword") }}</FieldLabel>
              <Input id="confirm-password" type="password" required />
            </Field>

            <Field>
              <Button type="submit">{{ t("signup.button") }}</Button>
            </Field>
            <Field>
              <FieldDescription class="px-6 text-center">
                {{ t("signup.haveAccount") }}
                  <router-link to="/login" class="text-primary underline hover:text-primary/80">{{ t("signup.login") }}</router-link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    <FieldDescription class="px-6 text-center">
      By clicking continue, you agree to our <a href="#">Terms of Service</a>
      and <a href="#">Privacy Policy</a>.
    </FieldDescription>
  </div>
</template>
