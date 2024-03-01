import { defineNuxtPlugin } from "#app";
import Naive from "naive-ui";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Naive);
});
