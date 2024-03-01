<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="flex items-center justify-center w-full h-full">
    <n-result
      ref="resultRef"
      :status="status && (status.toString() as any)"
      :title="code ? (message ? `(${code}) ${message}` : `(${code})`) : message"
      :description="description !== message ? description : undefined"
      :size="size"
    >
      <slot
        :icon="icon"
        :code="code"
        :stack="stack"
        :status="status"
        :message="message"
        :detiail="detiail"
        :description="description"
      >
        <p
          v-if="description !== detiail"
          class="text-center whitespace-pre-wrap"
        >
          {{ detiail }}
        </p>
        <n-collapse-transition
          :show="showStack"
          class="max-w-1280px bg-black text-white p-20px rounded-lg mx-auto"
        >
          <n-log
            v-if="!isHTML(stack || '')"
            :log="stack"
          />
          <div
            v-else
            v-html="stack"
          />
        </n-collapse-transition>
      </slot>
      <template #icon>
        <slot
          name="icon"
          :code="code"
          :status="status"
        >
          <fa-icon
            v-if="icon"
            size="var(--n-icon-size)"
            :name="icon"
          />
          <n-icon
            v-else
            size=""
            color="var(--n-icon-color)"
          >
            <info-icon v-if="status === 'info'" />
            <success-icon v-else-if="status === 'success'" />
            <warning-icon v-else-if="status === 'warning'" />
            <error-icon v-else-if="status === 'error'" />
          </n-icon>
        </slot>
      </template>
      <template #footer>
        <slot
          name="footer"
          :icon="icon"
          :code="code"
          :stack="stack"
          :status="status"
          :message="message"
          :detiail="detiail"
          :description="description"
        >
          <n-flex
            justify="center"
            class="gap-20px"
          >
            <template v-if="status === 401">
              <n-button @click="goAuth">
                {{ $t("fa.error.action.auth") }}
              </n-button>
            </template>
            <template v-else-if="status === 403 || status === 404">
              <n-button @click="goHome">
                {{ $t("fa.error.action.home") }}
              </n-button>
              <n-button @click="goBack">
                {{ $t("fa.error.action.back") }}
              </n-button>
            </template>
            <template v-else>
              <n-button @click="known">
                {{ $t("fa.error.action.know") }}
              </n-button>
            </template>
            <n-button
              v-if="stack"
              @click="toggleShowStack()"
            >
              {{
                $t(`fa.common.${showStack ? "hide" : "show"}`, [
                  $t("fa.error.action.stack"),
                ])
              }}
            </n-button>
          </n-flex>
        </slot>
      </template>
    </n-result>
  </div>
</template>
<script setup lang="ts">
import type { NuxtError } from "#app";
import { useToggle } from "@vueuse/core";
import type { NResult } from "naive-ui";
import {
ErrorIcon,
InfoIcon,
SuccessIcon,
WarningIcon,
} from "naive-ui/lib/_internal/icons/index";

const TRANSLATED_STATUS = [401, 403, 404, 418, 500] as const;
const CAN_PPROCESS_STATUS = [
  ...TRANSLATED_STATUS,
  "info",
  "success",
  "warning",
  "error",
] as const;
type CanProcessStatus = (typeof CAN_PPROCESS_STATUS)[number];

// #region 组件通信
const props = withDefaults(
  defineProps<{
    /**
     * 状态
     */
    // eslint-disable-next-line vue/require-default-prop
    status?: CanProcessStatus;
    /**
     * 错误信息
     */
    error: NuxtError;
    /**
     * 全局使用
     */
    global?: boolean;
    /**
     * 大小
     */
    size?: "medium" | "small" | "large" | "huge";
  }>(),
  {
    global: false,
    size: "medium",
  }
);

const emit = defineEmits<{
  /**
   * 清除错误
   * @description 点击我知道了按钮时触发
   */
  clearError: [optionsAndError: { redirect?: string } & NuxtError];
}>();
// #endregion

// #region 全局变量
const { t } = useI18n();
const router = useRouter();
const appConfig = useAppConfig();
const localePath = useLocalePath();
const runtimeConfig = useRuntimeConfig();
// #endregion

// #region 计算属性
const error = computedEager(() =>
  props.error.statusCode !== 500
    ? props.error
    : (props.error.cause as NuxtError) || props.error
);
const code = computedEager(() => {
  return (
    (typeof props.status === "number" ? props.status : undefined) ||
    error.value.statusCode
  );
});
const stack = computedEager(() => error.value.stack || props.error.stack);
const status = computedEager<CanProcessStatus>(() => {
  return (
    props.status ||
    error.value.data?.level ||
    (CAN_PPROCESS_STATUS.includes(code.value as CanProcessStatus)
      ? (code.value as CanProcessStatus)
      : "error")
  );
});
const icon = computedEager(() => {
  switch (status.value) {
    case 401:
      return "twemoji:face-with-monocle";
    case 403:
      return "twemoji:raised-back-of-hand";
    case 404:
      return "twemoji:thinking-face";
    case 418:
      return "twemoji:teacup-without-handle";
    case 500:
      return "twemoji:face-with-crossed-out-eyes";
  }
});
const needUseTranslate = computedEager(() => {
  return TRANSLATED_STATUS.includes(code.value as any);
});
const message = computedEager(() => {
  return needUseTranslate.value && props.global
    ? t(`fa.error.list.${status.value}.title`)
    : error.value instanceof TypeError &&
      error.value.message === "Failed to fetch"
    ? t("fa.error.list.connection.title")
    : error.value.statusMessage || error.value.message;
});
const description = computedEager(() => {
  return needUseTranslate.value && props.global
    ? t(`fa.error.list.${status.value}.description`)
    : error.value.message;
});
const detiail = computedEager(() => {
  return props.global ? error.value.message : error.value.data?.detail;
});
// #endregion

// #region 操作相关
function goAuth() {
  emit(
    "clearError",
    Object.assign({}, props.error, {
      redirect: localePath(runtimeConfig.public.auth.provider.pages.login),
    })
  );
}
function goHome() {
  emit(
    "clearError",
    Object.assign({}, props.error, { redirect: localePath("/") })
  );
}
function goBack() {
  emit(
    "clearError",
    Object.assign({}, props.error, {
      redirect:
        (router.options.history.state.back as string) || localePath("/"),
    })
  );
}
function known() {
  emit("clearError", props.error);
}
// #endregion

// #region 调用栈相关
const [showStack, toggleShowStack] = useToggle(
  appConfig.nuxt.buildId === "dev" && !!stack.value
);
// #endregion

function isHTML(str: string) {
  return /<\/?[a-z][\s\S]*>/i.test(str);
}
</script>
