import type { RouteMeta, RouteRecordNormalized } from "#vue-router";
import type { PartialDeep } from "type-fest";

declare module "#vue-router" {
  interface RouteMeta {
    /**
     * 路由语言
     * @default 自动检测
     */
    lang?: string;
    /**
     * 路由名称
     * @default 自动检测
     */
    name?: string;
    /**
     * 路由类型
     * @default "page"
     */
    type?: "page" | "menu";
  }
}

/**
 * 格式化路由元数据
 * @description 就地修改路由元数据同时返回
 * @param route 路由信息
 * @param options 选项
 */
interface normalizeRouteMetaOptions {
  /**
   * 类型
   * "page" | "menu"
   * @default "page"
   */
  type?: "page" | "menu";
  /**
   * i18n 实例
   * @default useNuxtApp().$i18n
   */
  i18n?: ReturnType<typeof useI18n>;
}
export function normalizeRouteMeta(
  route: PartialDeep<RouteRecordNormalized> | RouteRecordNormalized,
  options: normalizeRouteMetaOptions = {
    type: "page",
    i18n: useNuxtApp().$i18n,
  }
) {
  if (!route.name) return;
  const { meta = {}, name } = route;
  const { type = "page", i18n = useNuxtApp().$i18n } = options;
  const { nav = {}, tab = {} } = meta as PartialDeep<RouteMeta>;
  const [file, lang] = (name as string).split("___");

  const title =
    meta.title ??
    i18n.t(`${type}s.${file}.title`, `${type}s.${file}.title`, {
      locale: lang,
    });
  const icon =
    meta.icon ??
    (i18n.te(`${type}s.${file}.title`)
      ? title[0]
      : type === "page"
      ? "material-symbols:pages"
      : "material-symbols:menu");
  const description =
    meta.description ??
    i18n.t(`${type}s.${file}.description`, `${type}s.${file}.description`, {
      locale: lang,
    });
  const paths = file.split("-");
  const parents = paths.slice(0, paths.length - 1);

  route.meta = {
    ...meta,
    icon,
    title,
    type,
    lang,
    name: file,
    description,
    nav: {
      ...nav,
      has: nav.has ?? true,
      show: nav.show ?? true,
      disabled: nav.disabled ?? false,
      parent:
        nav.parent ??
        (parents.join("-") as Exclude<typeof nav.parent, undefined>),
      order: nav.order ?? 0,
      icon: nav.icon ?? icon,
      title: nav.title ?? title,
      description: nav.description ?? description,
    },
    tab: {
      ...tab,
      has: tab.has ?? true,
      show: tab.show ?? true,
      icon: tab.icon ?? icon,
      title: tab.title ?? title,
      description: tab.description ?? description,
    },
  };

  return route.meta;
}
