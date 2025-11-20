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
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-3xl font-bold">
          {{ t("login.title") }}
        </CardTitle>
        <CardDescription>
          {{ t("login.welcome") }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel for="email">
                {{ t("login.email")}}
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </Field>
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password">
                  {{ t("login.password") }}
                </FieldLabel>
                <a
                  href="#"
                  class="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground"
                >
                  {{ t("login.forgot") }}
                </a>
              </div>
              <Input id="password" type="password" required />
            </Field>
            <FieldSeparator />
            <Field>
              <Button type="submit">
                {{ t("login.submit") }}
              </Button>
              <FieldDescription class="text-center">
                {{ t("login.no account") }}
                <router-link to="/signup" class="text-primary underline hover:text-primary/80">{{ t("login.signup") }}</router-link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
