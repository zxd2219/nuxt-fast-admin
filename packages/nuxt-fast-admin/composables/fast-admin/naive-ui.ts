// #region I18n
import * as locales from "naive-ui/lib/locales";
export function useNaiveUiI18n() {
  const { locale: _locale, fallbackLocale } = useI18n();

  type Locale = Exclude<
    keyof typeof locales,
    | "NLocale"
    | "NDateLocale"
    | "NPartialLocale"
    | "createLocale"
    | `date${string}`
  >;

  type LocaleDate = Exclude<
    keyof typeof locales,
    "NLocale" | "NDateLocale" | "NPartialLocale" | "createLocale" | Locale
  >;

  const locale = computed(() => {
    return (
      locales[useCamel(_locale.value) as Locale] ??
      locales[useCamel(fallbackLocale.value.toString()) as Locale]
    );
  });

  const dateLocale = computed(() => {
    return (
      locales[useCamel(`date-${_locale.value}`) as LocaleDate] ??
      locales[useCamel(`date-${fallbackLocale.value.toString()}`) as LocaleDate]
    );
  });

  return {
    locale,
    dateLocale,
  };
}
// #endregion

// #region Feedback
import type { DialogApiInjection } from "naive-ui/lib/dialog/src/DialogProvider";
import type { LoadingBarApiInjection } from "naive-ui/lib/loading-bar/src/LoadingBarProvider";
import type { MessageApiInjection } from "naive-ui/lib/message/src/MessageProvider";
import type { NotificationApiInjection } from "naive-ui/lib/notification/src/NotificationProvider";
import type { FunctionalComponent } from "vue";

declare global {
  /* eslint-disable no-var */
  var $message: MessageApiInjection;
  var $dialog: DialogApiInjection;
  var $notify: NotificationApiInjection;
  var $loadingBar: LoadingBarApiInjection;
  /* eslint-enable no-var */
}

export function useRegisterFeedbackGlobal() {
  const { isLoading } = useLoadingIndicator();
  const RegisterFeedbackGlobal: FunctionalComponent = () => {
    globalThis.$message = useMessage();
    globalThis.$dialog = useDialog();
    globalThis.$notify = useNotification();
    globalThis.$loadingBar = useLoadingBar();

    watch(
      () => isLoading.value,
      (value) => {
        if (value) {
          globalThis.$loadingBar.start();
        } else {
          globalThis.$loadingBar.finish();
        }
      },
      { immediate: true }
    );
  };

  return RegisterFeedbackGlobal;
}
// #endregion
