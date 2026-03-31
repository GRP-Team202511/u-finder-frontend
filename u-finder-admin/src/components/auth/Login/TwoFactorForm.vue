<!-- This code was completed by GRP Team 2025.11. -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { verifyTwoFactor } from "@/api/adminApi";
import { useAdminStore } from "@/stores/adminStore";

const props = defineProps<{
  tempToken: string
}>();

const { t } = useI18n();
const adminStore = useAdminStore();
const router = useRouter();


const mode = ref<"totp" | "recovery">("totp");
const verifying = ref(false);
const codeValue = ref("");

const isTotp = computed(() => mode.value === "totp");

const normalizedRecoveryCode = computed(() => codeValue.value.trim().toUpperCase());

const isValidTotp = () => /^\d{6}$/.test(codeValue.value.trim());
const isValidRecovery = () => /^[0-9A-F]{8}$/.test(normalizedRecoveryCode.value);

const handleVerify = async () => {
  if (isTotp.value ? !isValidTotp() : !isValidRecovery()) {
    toast.error(t("twofa.invalid"));
    return;
  }

  verifying.value = true;

  try {
    const code = isTotp.value ? codeValue.value.trim() : normalizedRecoveryCode.value;
    const response = await verifyTwoFactor(
      { code, type: isTotp.value ? "totp" : "recovery" },
      props.tempToken,
    );
    adminStore.setAdmin(response.data);
    toast.success(t("twofa.success"));
      router.push({ name: "Dashboard" });
    } catch (error: any) {
    if (error.response?.status === 401) {
      toast.error(t("twofa.invalid"));
    } else {
      toast.error(t("twofa.failed"));
      console.error("2FA verification failed", error);
    }
  } finally {
    verifying.value = false;
  }
};

const toggleMode = () => {
  mode.value = isTotp.value ? "recovery" : "totp";
  codeValue.value = "";
};
</script>

<template>
  <Card>
    <CardHeader class="text-center">
      <CardTitle class="text-3xl font-bold">{{ t("twofa.title") }}</CardTitle>
      <CardDescription>{{ t("twofa.description") }}</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleVerify">
        <FieldGroup>
          <Field>
            <FieldLabel class="block w-full text-center">
                {{ isTotp ? t("twofa.totpLabel") : t("twofa.recoveryLabel") }}
            </FieldLabel>
            <div v-if="isTotp" class="flex justify-center">
              <InputOTP id="totp" v-model="codeValue" :maxlength="6" required>
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
            <div v-else>
              <Input
                v-model="codeValue"
                id="recovery"
                maxlength="8"
                autocomplete="one-time-code"
                placeholder="A1B2C3D4"
                class="text-center uppercase"
                required
              />
            </div>
            <FieldDescription class="text-center">
              {{ isTotp ? t("twofa.totpHint") : t("twofa.recoveryHint") }}
            </FieldDescription>
          </Field>
          <FieldGroup>
            <Button type="submit" :disabled="verifying">
              <Spinner v-if="verifying" class="animate-spin mr-2" />
              {{ t("twofa.verify") }}
            </Button>
            <Button type="button" variant="ghost" class="text-sm" @click="toggleMode">
              {{ isTotp ? t("twofa.switchToRecovery") : t("twofa.switchToTotp") }}
            </Button>
          </FieldGroup>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</template>
