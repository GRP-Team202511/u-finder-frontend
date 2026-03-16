<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref, computed } from "vue"
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

const passwordTouched = ref(false)

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

type ValidationDetail = {
  loc: Array<string | number>
  msg: string
  type: string
}
// Password validation: 8-20 chars, at least one letter and one digit
const isPasswordValid = computed(() => {
  const password = formData.value.password
  if (!password) return false
  
  const lengthValid = password.length >= 8 && password.length <= 20
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  
  return lengthValid && hasLetter && hasDigit
})

const handleSignup = async() => {
  signing.value = true
  occupied.value = false
  passwordTouched.value = true

  // Validate password format
  if (!isPasswordValid.value) {
    toast.error(t('signup.passwordError'))
    signing.value = false
    return
  }

  // Validate confirm password is filled
  if (!repeatPassword.value) {
    toast.error(t('signup.confirmPasswordRequired'))
    signing.value = false
    return
  }

  // Validate passwords match
  if (formData.value.password !== repeatPassword.value) {
    toast.error(t('signup.passwordMismatch'))
    signing.value = false
    return
  }

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
    } else if (error.response?.status === 422) {
      const details = error?.response?.data?.detail as ValidationDetail[] | undefined
      if (Array.isArray(details)) {
        const fields = details
          .flatMap((item) => Array.isArray(item.loc) ? item.loc : [])
          .map((item) => String(item))
        if (fields.includes("email")) {
          occupied.value = true
        }
      }
      toast.error(t('signup.unprocessable'))
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
              <Input 
                v-model="formData.password" 
                id="password" 
                type="password" 
                :class="{ 
                  'border-red-500': (passwordTouched && !isPasswordValid) || formData.password != repeatPassword 
                }" 
                @blur="passwordTouched = true"
                required
              />
              <FieldDescription v-if="passwordTouched && !isPasswordValid" class="text-red-500 text-sm">
                {{ t("signup.passwordError") }}
              </FieldDescription>
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
      {{ t("signup.continue") }}
      <router-link
        to="/terms-of-service"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary underline hover:text-primary/80"
      >
        {{ t("signup.termOfUse") }}
      </router-link>
      {{ t("signup.and") }}
      <router-link
        to="/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary underline hover:text-primary/80"
      >
        {{ t("signup.privacy") }}
      </router-link>.
    </FieldDescription>
  </div>
</template>
