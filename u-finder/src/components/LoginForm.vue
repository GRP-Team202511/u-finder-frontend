<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-3xl font-bold">
          Log in
        </CardTitle>
        <CardDescription>
          Welcome back! Please enter your details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel for="email">
                Email
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
                  Password
                </FieldLabel>
                <a
                  href="#"
                  class="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </Field>
            <FieldSeparator />
            <Field>
              <Button type="submit">
                Login
              </Button>
              <FieldDescription class="text-center">
                Don't have an account?
                <router-link to="/signup" class="text-primary underline hover:text-primary/80">Sign Up</router-link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
