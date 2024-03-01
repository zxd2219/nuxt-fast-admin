import { defineNuxtPlugin } from "#app";
import { type HookResult } from "@nuxt/schema";

import { FastCrud, type FsSetupOptions } from "@fast-crud/fast-crud";
import "@fast-crud/fast-crud/dist/style.css";

import {
  FsExtendsCopyable,
  FsExtendsEditor,
  FsExtendsJson,
  FsExtendsTime,
  FsExtendsUploader,
  type FsUploaderOptions,
} from "@fast-crud/fast-extends";

import type { FsEditorConfig } from "@fast-crud/fast-extends/dist/d/editor/type/config.js";
import UIAntd from "@fast-crud/ui-antdv";
import UIAntd4 from "@fast-crud/ui-antdv4";
import UIElement from "@fast-crud/ui-element";
import UINaive, { type UiSetupOptions } from "@fast-crud/ui-naive";

import { defu } from "defu";

type ExtendsOptions = {
  uploader?: FsUploaderOptions;
  editor?: FsEditorConfig;
};

declare module "#app" {
  interface RuntimeNuxtHooks {
    "fast-crud:setup": (options: FsSetupOptions) => HookResult;
    "fast-crud:extends:setup": (options: ExtendsOptions) => HookResult;
    "fast-crud:ui:setup": (options: UiSetupOptions) => HookResult;
  }
  interface NuxtHooks {
    "fast-crud:setup": (options: FsSetupOptions) => HookResult;
    "fast-crud:extends:setup": (options: ExtendsOptions) => HookResult;
    "fast-crud:ui:setup": (options: UiSetupOptions) => HookResult;
  }
}

declare module "nitropack" {
  interface NitroRuntimeHooks {
    "fast:crud:setup": (options: FsSetupOptions) => void;
    "fast:crud:extends:setup": (options: ExtendsOptions) => void;
    "fast:crud:ui:setup": (options: UiSetupOptions) => void;
  }
}

export default defineNuxtPlugin({
  enforce: "post",
  async setup(nuxtApp) {
    const { fastCrud } = useRuntimeConfig().public;

    // #region UI setup
    const uiSetupOptions: UiSetupOptions = {};
    await nuxtApp.callHook("fast-crud:ui:setup", uiSetupOptions);
    const _uiSetupOptions = defu(uiSetupOptions, fastCrud.uiSetupOptions);
    switch (fastCrud.framework) {
      case "element":
        nuxtApp.vueApp.use(UIElement, _uiSetupOptions);
        break;
      case "antdv":
        nuxtApp.vueApp.use(UIAntd, _uiSetupOptions);
        break;
      case "antdv4":
        nuxtApp.vueApp.use(UIAntd4, _uiSetupOptions);
        // @ts-ignore
        await import("@fast-crud/ui-antdv4/dist/style.css");
        break;
      case "naive":
        nuxtApp.vueApp.use(UINaive, _uiSetupOptions);
        break;
      default:
        break;
    }
    // #endregion

    // #region Extends setup
    const fsExtendsOptions: ExtendsOptions = {};
    await nuxtApp.callHook("fast-crud:extends:setup", fsExtendsOptions);
    for (let extendName of fastCrud.extends || []) {
      if (Array.isArray(extendName)) {
        extendName = extendName[0];
      }
      switch (extendName) {
        case "FsExtendsUploader":
          // eslint-disable-next-line no-case-declarations
          const uploaderOptions = fastCrud.extends?.find(
            (item) => item[0] === "FsExtendsUploader"
          )?.[1] as FsUploaderOptions | undefined;
          nuxtApp.vueApp.use(
            FsExtendsUploader,
            defu(fsExtendsOptions?.uploader || {}, uploaderOptions)
          );
          break;
        case "FsExtendsEditor":
          // eslint-disable-next-line no-case-declarations
          const editorConfig = fastCrud.extends?.find(
            (item) => item[0] === "FsExtendsEditor"
          )?.[1] as FsEditorConfig | undefined;
          nuxtApp.vueApp.use(
            FsExtendsEditor,
            defu(fsExtendsOptions?.editor || {}, editorConfig)
          );
          break;
        case "FsExtendsJson":
          nuxtApp.vueApp.use(FsExtendsJson);
          break;
        case "FsExtendsCopyable":
          nuxtApp.vueApp.use(FsExtendsCopyable);
          break;
        case "FsExtendsTime":
          nuxtApp.vueApp.use(FsExtendsTime);
          break;
        default:
          break;
      }
    }
    // #endregion

    // #region I18n setup
    if (nuxtApp.$i18n) {
      let hasZh = false;
      let hasEn = false;
      // @ts-ignore
      for (const locale of nuxtApp.$i18n.availableLocales) {
        if (locale.startsWith("zh")) {
          hasZh = true;
        }
        if (locale.startsWith("en")) {
          hasEn = true;
        }
      }
      if (!hasZh) {
        // @ts-ignore
        nuxtApp.$i18n.mergeLocaleMessage("zh", {
          fs: {},
        });
      }
      if (!hasEn) {
        // @ts-ignore
        nuxtApp.$i18n.mergeLocaleMessage("en", {
          fs: {},
        });
      }
    }
    // #endregion

    // #region FastCrud setup
    const fsSetupOptions: FsSetupOptions = {};
    await nuxtApp.callHook("fast-crud:setup", fsSetupOptions);
    nuxtApp.vueApp.use(
      FastCrud,
      defu(
        {
          i18n: nuxtApp.$i18n,
        },
        fsSetupOptions,
        {
          logger: fastCrud.logger,
        }
      )
    );
    // #endregion
  },
});
