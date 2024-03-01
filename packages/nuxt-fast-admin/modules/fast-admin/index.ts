import {
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  extendPages,
} from "nuxt/kit";
import type { RequiredDeep } from "type-fest";
import {
  replaceRouteMeta,
  updateLocalesSchema,
  updatePageKeyOptions,
} from "./runtime/utils/page";
import { getPagesModule } from "./runtime/utils/paths";
import { until } from "./runtime/utils/watch";

export interface ErrorOptions {
  /**
   * 错误处理器
   * @description 错误处理器
   * message: 消息提示
   * dialog: 弹窗提示
   * notify: 通知提示
   * global: 全局异常
   * none: 不处理
   * @default message
   */
  handler?: "message" | "dialog" | "notify" | "global" | "none";
  /**
   * 错误等级
   * @description 错误等级
   * info: 信息
   * success: 成功
   * warning: 警告
   * error: 错误
   * @default error
   */
  level?: "info" | "success" | "warning" | "error";
  /**
   * 防抖间隔 (ms)
   * @default 300
   */
  interval?: number;
  /**
   * 持续时间 (ms)
   * @default 3000
   */
  duration?: number;
}

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * 请求配置
   */
  fetch?: {
    /**
     * 错误配置
     * @description 请求错误配置
     */
    error?: {
      /**
       * 状态路径
       * @description 接口返回错误状态码路径
       * @default code
       */
      status?: string;
      /**
       * 消息路径
       * @description 接口返回错误消息路径
       * @default msg
       */
      message?: string;
    } & ErrorOptions;
  };
  /**
   * 错误配置
   */
  error?: ErrorOptions;
  /**
   * 结构配置
   */
  layouts?: {
    /**
     * 错误边界
     * @description 是否启用错误边界
     * @default true
     */
    boundary?: boolean;
  };
  /**
   * 页面配置
   */
  pages?: {
    /**
     * 国际化配置
     */
    locale?: {
      /**
       * schema路径
       * @description 国际化schema路径
       * @default locale
       */
      schema?: string;
    };
    /**
     * 鉴权页配置
     */
    auth?: {
      /**
       * 显示忘记密码
       * @description 是否显示忘记密码
       * @default true
       */
      forgot?: boolean;
    };
  };
}

declare module "@nuxt/schema" {
  interface PublicRuntimeConfig {
    fastAdmin: RequiredDeep<ModuleOptions>;
  }
}

declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    fastAdmin: RequiredDeep<ModuleOptions>;
  }
}

declare module "ofetch" {
  interface FetchOptions {
    error?: ErrorOptions;
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "fast-admin",
    configKey: "fastAdmin",
  },
  defaults: {
    fetch: {
      error: {
        status: "code",
        message: "msg",
        handler: "message",
        level: "error",
        interval: 300,
        duration: 3000,
      },
    },
    error: {
      handler: "message",
      level: "error",
      interval: 300,
      duration: 3000,
    },
    layouts: {
      boundary: true,
    },
    pages: {
      locale: {
        schema: "schema/locale.schema.json",
      },
      auth: {
        forgot: true,
      },
    },
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    nuxt.options.runtimeConfig.public.fastAdmin =
      options as RequiredDeep<ModuleOptions>;

    // 1. Add page meta type
    addTypeTemplate({
      filename: "types/fa-page-meta.d.ts",
      src: resolve("runtime/templates/page-meta.d.ts"),
      options: {
        pagesModule: getPagesModule(nuxt, resolve),
      },
    });

    // 2. Add naive ui patch type
    addTypeTemplate({
      filename: "types/fa-naive-ui.d.ts",
      src: resolve("runtime/templates/naive-ui.d.ts"),
    });

    // 3. Add app config type
    addTypeTemplate({
      filename: "types/fa-app-config.d.ts",
      src: resolve("runtime/templates/app-config.d.ts"),
    });

    // 4. Add error type
    addTypeTemplate({
      filename: "types/fa-error.d.ts",
      src: resolve("runtime/templates/error.d.ts"),
    });

    // 5. Replace route meta type
    replaceRouteMeta({ nuxt, resolve });

    // 6. When templates generated
    let typeTemplateAdded = false;
    nuxt.hook("app:templatesGenerated", () => {
      typeTemplateAdded = true;
    });

    // 7. Update locales schema and page key options
    extendPages((pages) => {
      updateLocalesSchema({
        nuxt,
        pages,
        filename: options?.pages?.locale?.schema!,
      });
      until(() => typeTemplateAdded).then(() =>
        updatePageKeyOptions({ nuxt, pages })
      );
    });
  },
});
