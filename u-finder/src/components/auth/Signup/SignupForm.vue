<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref } from "vue"
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
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { toast } from 'vue-sonner'
import { signup } from "@/api/userApi"


const { t } = useI18n()

const signing = ref(false)

const occupied = ref(false)

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const emit = defineEmits<{
  (e: "signup", payload: { name: string; email: string }): void
  (e: "signup-success", tempToken: string): void
}>()

const formData = ref({
  name: "",
  email: "",
  password: "",
})

const repeatPassword = ref("")

const handleSignup = async() => {
  signing.value = true
  occupied.value = false

  try {
    const response = await signup(formData.value)
    emit("signup", { name: formData.value.name, email: formData.value.email })
    emit("signup-success", response.data.temp_token)
    formData.value.password = ""
    repeatPassword.value = ""
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.log('Account already exists')
      toast.error(t('signup.occupied'))
      occupied.value = true
    } else {
      console.error('Sign up error:', error)
      toast.error(t('signup.error'))
    }
  } finally {
    signing.value = false
  }
}
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
          <form @submit.prevent="handleSignup">
          <FieldGroup>
            <Field>
              <FieldLabel for="username">{{ t("signup.username") }}</FieldLabel>
              <Input v-model="formData.name" id="username" type="text" required />
            </Field>

            <Field>
              <FieldLabel for="email">{{ t("signup.email") }}</FieldLabel>
              <Input v-model="formData.email" id="email" type="email" :class="{'border-red-500': occupied}" @focus="occupied=false" required />
            </Field>

            <Field>
              <FieldLabel for="password">{{ t("signup.password") }}</FieldLabel>
              <Input v-model="formData.password" id="password" type="password" :class="{ 'border-red-500 ': formData.password != repeatPassword }" required/>
            </Field>

            <Field>
              <FieldLabel for="confirm-password">{{ t("signup.confirmPassword") }}</FieldLabel>
              <Input v-model="repeatPassword" id="confirm-password" type="password" :class="{ 'border-red-500 ': formData.password != repeatPassword }" required />
            </Field>

            <Field>
              <Button type="submit" v-if="!signing">{{ t("signup.button") }}</Button>
              <Button varient="outline" v-if="signing" disabled>
                <Spinner class="animate-spin" />
                {{ t("signup.button") }}
              </Button>
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
      {{ t("signup.continue") }}<a href="#">{{ t("signup.termOfUse") }}</a>{{ t("signup.and") }}<a href="#">{{ t("signup.privacy") }}</a>.
    </FieldDescription>
  </div>
</template>
