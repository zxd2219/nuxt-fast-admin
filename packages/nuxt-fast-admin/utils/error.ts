import type { NuxtError } from "#app";
import type { ErrorHandler, ErrorLevel } from "#build/types/fa-error";
import { FetchError } from "ofetch";

const TRANSLATED_STATUS = [401, 403, 404, 418, 500] as const;
const errorMap = new Set<string>();
/**
 * 处理错误
 * @description
 * 未避免错误提示重复，默认使用300ms的防抖
 * 可设置 interval 为 false 关闭防抖
 * 认定同一错误的条件为：错误状态码
 * @param handler 处理器
 * @param options 错误处理选项
 */
interface HandleErrorOptions {
  /**
   * 错误处理器
   * @description 如果是 FetchError，则会尝试使用 fetch.error.handler
   * @default useRuntimeConfig().public.fastAdmin.error.handler || "message"
   */
  handler?: ErrorHandler;
  /**
   * 错误等级
   * @description 如果是 FetchError，则会尝试使用 fetch.error.level
   * @default error.data?.level || useRuntimeConfig().public.fastAdmin.error.level || "error"
   */
  level?: ErrorLevel;
  /**
   * I18N 实例
   * @default useNuxtApp().$i18n as Composer
   */
  i18n?: ReturnType<typeof useI18n>;
  /**
   * 防抖间隔
   * @description 如果是 FetchError，则会尝试使用 fetch.error.interval
   * @default useRuntimeConfig().public.fastAdmin.error.interval || 300
   */
  interval?: number;
  /**
   * 显示时间
   * @description 如果是 FetchError，则会尝试使用 fetch.error.duration
   * @default useRuntimeConfig().public.fastAdmin.error.duration || 3000
   */
  duration?: number;
}
export function handleError(
  error: NuxtError | Error | null | undefined,
  options: HandleErrorOptions = {}
) {
  if (!error) return true;
  const isFetchError = error instanceof FetchError;
  const config = useRuntimeConfig().public.fastAdmin;
  const {
    handler = (isFetchError ? config.fetch.error.handler : undefined) ||
      config.error.handler ||
      "message",
    level = (isFetchError ? config.fetch.error.level : undefined) ||
      (error as NuxtError).data?.level ||
      config.error.level ||
      "error",
    i18n = useNuxtApp().$i18n as ReturnType<typeof useI18n>,
    interval = (isFetchError ? config.fetch.error.interval : undefined) ||
      config.error.interval ||
      300,
    duration = (isFetchError ? config.fetch.error.duration : undefined) ||
      config.error.duration ||
      3000,
  } = options;
  if (isNuxtError(error) || error instanceof FetchError) {
    const realError =
      error instanceof FetchError
        ? error
        : error.statusCode === 500
        ? (error.cause as NuxtError)?.statusCode !== 500
          ? (error.cause as NuxtError)
          : error
        : error;

    const statusCode =
      ((realError as FetchError).response?._data[
        config.fetch.error.status
      ] as string) || realError.statusCode;
    const needTranslate = TRANSLATED_STATUS.includes(statusCode as any);
    const statusMessage = needTranslate
      ? i18n.t(`fa.error.list.${statusCode}.title`)
      : realError.statusMessage;
    const message =
      ((realError as FetchError).response?._data[
        config.fetch.error.message
      ] as string) || realError.message;

    if (errorMap.has(`${statusCode}`) && interval !== 0) return false;
    errorMap.add(`${statusCode}`);
    setTimeout(() => {
      errorMap.delete(`${statusCode}`);
      switch (handler) {
        case "message":
          globalThis.$message?.[level](
            `(${statusCode}) ${statusMessage || message}`,
            {
              duration: duration,
              keepAliveOnHover: true,
            }
          );
          break;
        case "dialog":
          globalThis.$dialog?.[level]({
            title: `(${statusCode}) ${statusMessage}`,
            content: message,
            positiveText: i18n.t("fa.error.action.know"),
          });
          break;
        case "notify":
          globalThis.$notify?.[level]({
            title: `(${statusCode}) ${statusMessage}`,
            content: message,
            duration: duration,
            keepAliveOnHover: true,
          });
          break;
        case "global":
          showError(realError);
          break;
      }
    }, interval);
  } else {
    const message =
      error instanceof TypeError && error.message === "Failed to fetch"
        ? i18n.t("fa.error.list.connection.title")
        : error.message;
    if (errorMap.has(`${message}`) && interval !== 0) return false;
    errorMap.add(`${message}`);
    setTimeout(() => {
      errorMap.delete(`${message}`);
      switch (handler) {
        case "message":
          globalThis.$message?.[level](`${message}`, {
            duration: duration,
            keepAliveOnHover: true,
          });
          break;
        case "dialog":
          globalThis.$dialog?.[level]({
            title: `${message}`,
            positiveText: i18n.t("fa.error.action.know"),
          });
          break;
        case "notify":
          globalThis.$notify?.[level]({
            title: `${message}`,
            duration: duration,
            keepAliveOnHover: true,
          });
          break;
        case "global":
          showError(error);
          break;
      }
    }, interval);
  }
  return handler === "none";
}
