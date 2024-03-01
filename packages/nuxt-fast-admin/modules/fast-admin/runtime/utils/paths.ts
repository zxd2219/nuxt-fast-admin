import type { Resolver } from "nuxt/kit";
import type { Nuxt } from "nuxt/schema";

/**
 * 获取 nuxt 的 pages module 的路径
 * @param nuxt Nuxt 实例
 * @param resolver Resolver 实例
 * @returns nuxt 的 pages module 的路径
 */
export function getPagesModule(nuxt: Nuxt, resolve: Resolver["resolve"]) {
  return resolve(nuxt.options.appDir, "../pages/runtime/composables");
}
