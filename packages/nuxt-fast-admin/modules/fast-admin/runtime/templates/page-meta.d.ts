import type { AppConfig } from "nuxt/schema";

export interface BaseMeta {
  /**
   * 图标
   * @default 标题首字
   */
  icon?: string;
  /**
   * 标题
   * @default 翻译源 `{pages|menus}.{文件路径|key}.title`
   * @example bar.vue => 翻译源 `{pages|menus}.bar.title`
   * @example foo/bar.vue => 翻译源 `{pages|menus}.foo.bar.title`
   */
  title?: string;
  /**
   * 描述
   * @default 翻译源 `{pages|menus}.{文件路径|key}.description`
   * @example bar.vue => 翻译源 `{pages|menus}.bar.description`
   * @example foo/bar.vue => 翻译源 `{pages|menus}.foo.bar.description`
   */
  description?: string;
}

export interface NavMetaParent {
  /**
   * 父级菜单
   * @default 文件所在目录
   */
  parent?:
    | (AppConfig["menus"][number]["key"] extends `<%= "$" %>{infer U}`
        ? U
        : never)
    | "$root";
}

export interface NavMeta extends BaseMeta {
  /**
   * 导航有无
   * @description 是否显示导航
   * @default true
   */
  has?: boolean;
  /**
   * 是否显示
   * @description 是否显示在导航中
   * @default true
   */
  show?: boolean;
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * 导航排序
   * @default 0
   */
  order?: number;
}

export interface TabMeta extends BaseMeta {
  /**
   * 标签有无
   * @description 是否显示标签
   * @default true
   */
  has?: boolean;
  /**
   * 是否显示
   * @description 是否显示在标签中
   * @default true
   */
  show?: boolean;
}

export interface AuthMeta {
  /**
   * 只允许未登录
   */
  unauthenticatedOnly?: boolean;
  /**
   * 已登录跳转
   */
  navigateAuthenticatedTo?: string;
  /**
   * 未登录跳转
   */
  navigateUnauthenticatedTo?: string;
  /**
   * 鉴权权限
   */
  authenticatedPermissions?: string | string[];
}

declare module "<%= options.pagesModule %>" {
  interface PageMeta extends BaseMeta {
    /**
     * 导航配置
     */
    nav?: NavMeta & NavMetaParent;
    /**
     * 标签配置
     */
    tab?: TabMeta;
    /**
     * 鉴权配置
     */
    auth?: AuthMeta | boolean;
  }
}
