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
import { login } from "@/api/adminApi"
import { useAdminStore } from "@/stores/adminStore"
import { useRouter } from "vue-router"

const { t } = useI18n()
const adminStore = useAdminStore()
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
const blocked = ref(false)

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
  blocked.value = false

  try {
    const response = await login(form.value)
    if (response.status === 200) {
      adminStore.setAdmin(response.data)
      router.push({ name: 'Dashboard' })
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
    const status = error.response?.status
    const message = String(error?.response?.data?.message || '').toLowerCase()
    const detailText = String(error?.response?.data?.detail || '').toLowerCase()
    const combined = `${message} ${detailText}`

    const isBlocked = combined.includes('blocked') || combined.includes('封禁') || combined.includes('封鎖')
    const isNotFound =
      combined.includes('user not found') ||
      combined.includes('account doesn\'t exist') ||
      combined.includes('account does not exist') ||
      combined.includes('no account') ||
      combined.includes('不存在')
    const isWrongPassword =
      combined.includes('incorrect password') ||
      combined.includes('password is incorrect') ||
      combined.includes('密码不正确') ||
      combined.includes('密碼不正確')

    if ((status === 403 && isBlocked) || isBlocked) {
      blocked.value = true
      toast.error(t("login.blocked"))
    } else if (status === 404 || isNotFound) {
      console.log("User not found")
      notFound.value = true
      toast.error(t("login.not_found"))
    } else if (status === 401 && isWrongPassword) {
      console.log("Wrong password")
      unauth.value = true
      toast.error(t("login.unauth"))
    } else if (status === 401) {
      notFound.value = true
      unauth.value = true
      toast.error(t("login.invalid_credentials"))
    } else if (status === 422) {
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
    }
  } finally {
    logging.value = false
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
                :class="{ 'border-red-500 ': notFound || blocked }"
                @focus="notFound = false; blocked = false"
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
                :class="{ 'border-red-500 ': unauth || blocked }"
                @focus="unauth = false; blocked = false"
              />
            </Field>
            <FieldSeparator />
            <Field>
              <Button type="submit" v-if="!logging">
                {{ t("login.submit") }}
              </Button>
              <Button variant="outline" v-if="logging" disabled>
                <Spinner class="animate-spin" />
                {{ t("login.submit") }}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
