import { defineNuxtPlugin } from "#app";
import Antdv from "ant-design-vue";
import "ant-design-vue/dist/reset.css";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Antdv);
});
