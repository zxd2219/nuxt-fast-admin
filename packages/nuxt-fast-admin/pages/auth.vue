<template>
  <div
    class="flex items-center justify-center h-full bg-no-repeat bg-center bg-cover bg-[url(/images/pages/auth/bg.png)]"
  >
    <div
      class="flex flex-col md:flex-row w-full max-w-1024px m-y-0 m-x-20px bg-#fff rounded-10px shadow-[0_0_4px_rgb(0_0_0_/_20%)]"
    >
      <img
        class="w-50% hidden md:block object-contain"
        src="/images/pages/auth/pic.png"
        alt="pic"
      >
      <n-form
        ref="authFormRef"
        class="flex flex-1 flex-col justify-center p-60px"
        :model="authForm"
        :rules="authFormRules"
        label-width="80px"
      >
        <div class="flex items-center justify-center mb-40px">
          <img
            class="w-40px mr-10px"
            :src="appConfig.fastAdmin.favicon"
            alt="logo"
          >
          <h1>{{ appConfig.fastAdmin.title }}</h1>
        </div>
        <n-form-item
          :label="$t('pages.auth.username')"
          path="username"
        >
          <n-input
            v-model:value="authForm.username"
            :placeholder="
              $t('fa.common.input', [
                $t('fa.common.your', [$t('pages.auth.username')]),
              ])
            "
          />
        </n-form-item>
        <n-form-item
          :label="$t('pages.auth.password')"
          path="password"
        >
          <n-input
            v-model:value="authForm.password"
            type="password"
            :placeholder="
              $t('fa.common.input', [
                $t('fa.common.your', [$t('pages.auth.password')]),
              ])
            "
          />
        </n-form-item>
        <n-form-item
          v-if="authType === 'signup'"
          :label="$t('pages.auth.password')"
          path="repeat"
        >
          <n-input
            v-model:value="authForm.repeat"
            type="password"
            :placeholder="
              $t('fa.common.repeat', [
                $t('fa.common.your', [$t('pages.auth.password')]),
              ])
            "
          />
        </n-form-item>
        <n-form-item>
          <div class="flex items-center justify-between w-full">
            <n-checkbox
              id="remember"
              v-model:checked="remember"
              :label="$t('pages.auth.remember')"
            />
            <n-button
              v-if="authConfig.forgot && authType === 'signin'"
              text
              @click="$nuxt.callHook('fast-admin:auth:forget')"
            >
              {{ $t("pages.auth.forget", [$t("pages.auth.password")]) }}
            </n-button>
            <n-button
              text
              @click="authType = authType === 'signin' ? 'signup' : 'signin'"
            >
              {{
                $t("fa.common.to", [
                  $t(
                    `pages.auth.${authType === "signin" ? "signup" : "signin"}`
                  ),
                ])
              }}
            </n-button>
          </div>
        </n-form-item>
        <n-form-item>
          <n-button
            class="w-full"
            :loading="status === 'loading'"
            type="primary"
            @click="handleSubmit"
          >
            {{
              authType === "signin"
                ? $t("pages.auth.signin")
                : $t("pages.auth.signup")
            }}
          </n-button>
        </n-form-item>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInst } from "naive-ui";
import type { HookResult } from "nuxt/schema";
import { FetchError } from "ofetch";

declare module "#app" {
  interface RuntimeNuxtHooks {
    "fast-admin:auth:forget": () => HookResult;
  }
  interface NuxtHooks {
    "fast-admin:auth:forget": () => HookResult;
  }
}

declare module "nitropack" {
  interface NitroRuntimeHooks {
    "fast-admin:auth:forget": () => void;
  }
}

definePageMeta({
  layout: "full",
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const appConfig = useAppConfig();
const authConfig = useRuntimeConfig().public.fastAdmin.pages.auth;
const localePath = useLocalePath();
const { signIn, signUp, status } = useAuth();

const remember = ref(true);
syncRef(remember, useCookie("auth:remember", { maxAge: 60 * 60 * 24 * 30 }), {
  immediate: true,
});

const authType = ref<"signin" | "signup">("signin");
const authForm = ref({
  username: "",
  password: "",
  repeat: "",
});
const authFormRef = ref<FormInst>();
const authFormRules = ref({
  username: [
    {
      required: true,
      message: t("fa.common.input", [
        t("fa.common.your", [t("pages.auth.username")]),
      ]),
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: t("fa.common.input", [
        t("fa.common.your", [t("pages.auth.password")]),
      ]),
      trigger: "blur",
    },
  ],
  repeat: [
    {
      required: true,
      message: t("fa.common.input", [
        t("fa.common.your", [t("pages.auth.password")]),
      ]),
      trigger: "blur",
    },
    {
      validator: (rule: any, value: string) => {
        if (value !== authForm.value.password) {
          return Promise.reject(
            t("fa.common.repeat", [
              t("fa.common.your", [t("pages.auth.password")]),
            ])
          );
        }
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ],
});

async function handleSubmit() {
  try {
    await authFormRef.value?.validate();
  } catch (error) {
    return;
  }
  const callbackUrl =
    [route.query.callback].flat()[0] ||
    (router.options.history.state.back as string) ||
    localePath("/");
  try {
    if (authType.value === "signin") {
      await signIn(authForm.value, { callbackUrl });
    } else {
      await signUp(authForm.value, { callbackUrl });
    }
  } catch (error) {
    if (error instanceof FetchError) {
      handleError(error);
    }
  }
}
</script>
