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
import { toast } from 'vue-sonner'
import { login } from "@/api/userApi"
import { useUserStore } from "@/stores/userStore"
import { useRouter } from "vue-router"
import TurnstileWidget from "@/components/auth/TurnstileWidget.vue"

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()
const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const emit = defineEmits<{
  (event: "two-factor", tempToken: string): void
}>()

const logging = ref(false)
const unauth = ref(false)
const notFound = ref(false)
const turnstileToken = ref('')
const turnstileRef = ref<InstanceType<typeof TurnstileWidget>>()

const form = ref({
  email: '',
  password: '',
})

type ValidationDetail = {
  loc: Array<string | number>
  msg: string
  type: string
}

const handleLogin = async() => {
  logging.value = true
  unauth.value = false
  notFound.value = false

  try {
    const response = await login({
      ...form.value,
      turnstile_token: turnstileToken.value,
    })
    if (response.status === 200) {
      userStore.setUser(response.data)
      router.push({ name: 'UserProfile' })
      return
    }
    if (response.status === 202) {
      const tempToken = response.data.temp_token
      if (tempToken) {
        toast.info(t("login.twoFactorRequired"))
        emit("two-factor", tempToken)
        return
      }
    }
    throw new Error("Unexpected login response")
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log("Wrong password")
      unauth.value = true
      toast.error(t("login.unauth"))
    } else if(error.response?.status === 404) {
      console.log("User not found")
      notFound.value = true
      toast.error(t("login.not_found"))
    } else if (error.response?.status === 403 || error.response?.status === 423) {
      toast.error(t("login.forbidden"))
    } else if (error.response?.status === 400) {
      toast.error(t("turnstile.verifyFailed"))
    } else if (error.response?.status === 503) {
      toast.error(t("turnstile.serviceUnavailable"))
    } else if (error.response?.status === 422) {
      const details = error?.response?.data?.detail as ValidationDetail[] | undefined
      if (Array.isArray(details)) {
        const fields = details
          .flatMap((item) => Array.isArray(item.loc) ? item.loc : [])
          .map((item) => String(item))
        if (fields.includes("email")) {
          notFound.value = true
        }
        if (fields.includes("password")) {
          unauth.value = true
        }
      }
      toast.error(t("login.unprocessable"))
    } else {
      console.error("Login error:", error)
      toast.error(t("login.error"))
    }
  } finally {
    logging.value = false
    turnstileToken.value = ''
    turnstileRef.value?.reset()
  }
}
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
        <form @submit.prevent="handleLogin">
          <FieldGroup>
            <Field>
              <FieldLabel for="email">
                {{ t("login.email")}}
              </FieldLabel>
              <Input
                v-model="form.email"
                id="email"
                type="email"
                :class="{ 'border-red-500 ': notFound }"
                @focus="notFound = false"
                required
              />
            </Field>
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password">
                  {{ t("login.password") }}
                </FieldLabel>
                <router-link
                  to="/login/reset"
                  class="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground"
                >
                  {{ t("login.forgot") }}
                </router-link>
              </div>
              <Input 
                v-model="form.password" 
                id="password" 
                type="password" 
                required 
                :class="{ 'border-red-500 ': unauth }"
                @focus="unauth = false"
              />
            </Field>
            <TurnstileWidget
              ref="turnstileRef"
              @verify="(token: string) => turnstileToken = token"
              @expire="turnstileToken = ''"
              @error="turnstileToken = ''"
            />
            <FieldSeparator />
            <Field>
              <Button type="submit" v-if="!logging">
                {{ t("login.submit") }}
              </Button>
              <Button varient="outline" v-if="logging" disabled>
                <Spinner class="animate-spin" />
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
