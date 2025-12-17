<script setup lang="ts">
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
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useI18n } from "vue-i18n";

const { t } = useI18n()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ t("signup.verification.enter") }}</CardTitle>
      <CardDescription>{{ t("signip.verification.sent") }}</CardDescription>
    </CardHeader>
    <CardContent>
      <form>
        <FieldGroup>
          <Field>
            <FieldLabel for="otp" class="text-center">
              <!-- Verification code -->
            </FieldLabel>
            <div class="flex justify-center">
              <InputOTP id="otp" :maxlength="6" required>
                <InputOTPGroup class="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot :index="0" />
                  <InputOTPSlot :index="1" />
                  <InputOTPSlot :index="2" />
                  <InputOTPSlot :index="3" />
                  <InputOTPSlot :index="4" />
                  <InputOTPSlot :index="5" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <FieldDescription class="text-center">
              {{ t("signup.verification.enter2") }}
            </FieldDescription>
          </Field>
          <FieldGroup>
            <Button type="submit">
              {{ t("signup.verification.verify") }}
            </Button>
            <FieldDescription class="text-center">
              {{ t("signup.verification.receive") }} <a href="#">{{ t("signup.verification.receive") }}</a>
            </FieldDescription>
          </FieldGroup>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</template>
