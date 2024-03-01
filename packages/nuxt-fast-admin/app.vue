<template>
  <naive-config>
    <n-config-provider
      :hljs="hljs"
      :locale="locale"
      :date-locale="dateLocale"
    >
      <n-global-style />
      <n-dialog-provider>
        <n-message-provider>
          <n-notification-provider>
            <n-loading-bar-provider>
              <register-feedback-global />
              <fs-ui-context>
                <nuxt-layout>
                  <nuxt-error-boundary
                    v-if="runtimeConfig.public.fastAdmin.layouts?.boundary"
                  >
                    <nuxt-page :keepalive="keepalive" />
                    <template #error="{ error, clearError }">
                      <fa-error
                        :error="error.value"
                        @clear-error="handleClearError($event, clearError)"
                      />
                    </template>
                  </nuxt-error-boundary>
                  <nuxt-page v-else />
                </nuxt-layout>
              </fs-ui-context>
            </n-loading-bar-provider>
          </n-notification-provider>
        </n-message-provider>
      </n-dialog-provider>
    </n-config-provider>
  </naive-config>
</template>

<script setup lang="tsx">
import { FsUiContext } from "@fast-crud/ui-naive";
import hljs from "highlight.js/lib/core";

import type { NuxtError } from "#app";
import "@unocss/reset/normalize.css";
import { useFaHistories } from "./composables/fast-admin";

const router = useRouter();
const { histories } = useFaHistories();
const runtimeConfig = useRuntimeConfig();
const { locale, dateLocale } = useNaiveUiI18n();
const RegisterFeedbackGlobal = useRegisterFeedbackGlobal();

hljs.registerLanguage("naive-log", () => ({
  contains: [
    {
      className: "number",
      begin: /\d+/,
    },
  ],
}));

function handleClearError(
  optionsAndError: { redirect?: string } & NuxtError,
  clearError: (optionsAndError: { redirect?: string } & NuxtError) => void
) {
  clearError(optionsAndError);
  if (optionsAndError.redirect) {
    router.push(optionsAndError.redirect);
  }
}

import type { KeepAliveProps } from "vue";

const keepalive = computedEager<KeepAliveProps>(() => {
  return {
    max: 10,
  };
});
</script>

<style>
html,
body,
#__nuxt,
.n-config-provider {
  @apply w-full h-full m-0;
}

.icon {
  @apply !flex items-center justify-center;
}
</style>
