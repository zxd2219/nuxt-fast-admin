import dayjsLocales from "dayjs/locale.json";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },
  modules: [
    "nuxt-icon",
    "nuxt-radash",
    [
      "dayjs-nuxt",
      {
        locales: dayjsLocales.map((locale) => locale.key),
        defaultLocale: "zh-cn",
      },
    ],
    [
      "@nuxtjs/i18n",
      {
        langDir: "locales",
        locales: [
          { code: "zh-CN", iso: "zh-CN", file: "zh-CN.json" },
          { code: "en-US", iso: "en-US", file: "en-US.json" },
        ],
        defaultLocale: "zh-CN",
      },
    ],
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@vueuse/nuxt",
    "@unocss/nuxt",
    "@bg-dev/nuxt-naiveui",
    [
      "nuxt-open-fetch",
      {
        disableNuxtPlugin: true,
      },
    ],
    [
      "@sidebase/nuxt-auth",
      {
        provider: {
          type: "refresh",
          pages: {
            login: "/auth",
          },
        },
        globalAppMiddleware: false,
      },
    ],
    "@ucstu/nuxt-fast-crud",
  ],
});
