import * as FastCrud from "@fast-crud/fast-crud";
import type { FsUploaderOptions } from "@fast-crud/fast-extends";
import type { FsEditorConfig } from "@fast-crud/fast-extends/dist/d/editor/type/config.js";
import type { UiSetupOptions } from "@fast-crud/ui-naive";
import {
  addComponent,
  addImportsSources,
  addPlugin,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";
import type { RequiredDeep } from "type-fest";

type ExtendsKeies =
  | "FsExtendsUploader"
  | "FsExtendsEditor"
  | "FsExtendsJson"
  | "FsExtendsCopyable"
  | "FsExtendsTime";

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * The framework to use
   */
  framework: "element" | "antdv" | "antdv4" | "naive";
  /**
   * The extends options
   */
  extends?: Array<
    | ExtendsKeies
    | ["FsExtendsUploader", FsUploaderOptions]
    | ["FsExtendsEditor", FsEditorConfig]
  >;
  /**
   * The options of UI
   */
  uiSetupOptions?: UiSetupOptions;
  /**
   * The options of logger
   */
  logger?: FastCrud.LoggerConfig;
}

declare module "@nuxt/schema" {
  interface PublicRuntimeConfig {
    fastCrud: RequiredDeep<ModuleOptions>;
  }
}

declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    fastCrud: RequiredDeep<ModuleOptions>;
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-fast-crud",
    configKey: "fastCrud",
  },
  // Default configuration options of the Nuxt module
  defaults: {
    framework: "naive",
    extends: [],
    uiSetupOptions: {
      setupIcons: true,
    },
    logger: {
      off: {
        tableColumns: false,
      },
    },
  },
  setup(options, nuxt) {
    nuxt.options.runtimeConfig.public.fastCrud =
      options as RequiredDeep<ModuleOptions>;
    const { resolve } = createResolver(import.meta.url);

    nuxt.options.build.transpile.push(
      "@fast-crud/fast-crud",
      "@fast-crud/fast-extends",
      "@fast-crud/ui-interface",
      `@fast-crud/ui-${options.framework}`
    );

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin({
      name: `fast-crud:ui:${options.framework}`,
      src: resolve(`./runtime/${options.framework}`),
    });
    addPlugin({
      name: "fast-crud",
      src: resolve("./runtime/plugin"),
    });

    // Find all components in fast-crud and add them to the component library
    Object.keys(FastCrud)
      .filter((name) => /^Fs[A-Z]/.test(name))
      .forEach((name) => {
        addComponent({
          name,
          export: name,
          filePath: "@fast-crud/fast-crud",
          mode: ["FsCrud"].includes(name) ? "client" : "all",
        });
      });

    // Add all useXXX composition API in fast-crud to the imports sources
    addImportsSources({
      from: "@fast-crud/fast-crud",
      imports: Object.keys(FastCrud).filter(
        (name) =>
          /^use[A-Z]/.test(name) && !["useI18n", "useMerge"].includes(name)
      ),
    });
  },
});
