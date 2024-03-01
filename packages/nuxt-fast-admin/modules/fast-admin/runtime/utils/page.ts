import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Resolver } from "nuxt/kit";
import type { Nuxt, NuxtPage } from "nuxt/schema";
import { grep, mkdir, sed } from "shelljs";
import { getPagesModule } from "./paths";

/**
 * 更新 locales schema
 * @description 根据 pages 生成 locales schema
 * @param options 选项
 */
interface updateLocalesSchemaOptions {
  nuxt: Nuxt;
  pages: NuxtPage[];
  filename: string;
}
export function updateLocalesSchema(options: updateLocalesSchemaOptions) {
  const { nuxt, pages, filename } = options;
  const _pages = getFlatPages(pages);
  const filePath = join(nuxt.options.buildDir, filename);
  const navParentKeys = getNavParentKeys(pages).filter(
    (name) => name !== "$root"
  );

  mkdir("-p", filePath.split("/").slice(0, -1).join("/"));
  writeFileSync(
    filePath,
    JSON.stringify({
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        menus: {
          type: "object",
          properties: {
            ...Object.fromEntries(
              navParentKeys.map((name) => [
                name,
                {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                    },
                    description: {
                      type: "string",
                    },
                  },
                  additionalProperties: true,
                  required: ["title", "description"],
                },
              ])
            ),
          },
          additionalProperties: true,
          required: Array.from(new Set(navParentKeys.map((name) => name))),
        },
        pages: {
          type: "object",
          properties: {
            ...Object.fromEntries(
              _pages.map(({ name }) => [
                name,
                {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                    },
                    description: {
                      type: "string",
                    },
                  },
                  additionalProperties: true,
                  required: ["title", "description"],
                },
              ])
            ),
          },
          additionalProperties: true,
          required: Array.from(new Set(_pages.map(({ name }) => name))),
        },
      },
      additionalProperties: true,
    })
  );
}

/**
 * 更新 PageKeyOption 的 key 类型
 * @description 用于生成 PageKeyOption 的 key 类型
 * @param options 选项
 */
interface updatePageKeyOptionsOptions {
  nuxt: Nuxt;
  pages: NuxtPage[];
}
export function updatePageKeyOptions(options: updatePageKeyOptionsOptions) {
  const { nuxt, pages } = options;
  const filePath = join(nuxt.options.buildDir, "types/fa-app-config.d.ts");
  const navParentKeys = getNavParentKeys(pages).filter(
    (name) => name !== "$root"
  );
  mkdir("-p", filePath.split("/").slice(0, -1).join("/"));
  sed(
    "-i",
    /key: \/\* fast-admin-page-key \*\/ [\w\W]*?;/gi,
    navParentKeys.length
      ? `key: /* fast-admin-page-key */ "${navParentKeys.join('" | "')}";`
      : "key: /* fast-admin-page-key */ string;",
    filePath
  );
}

/**
 * 替换 nuxt/pages 中的 RouteMeta
 * @description 使用了 router-meta 插件后，nuxt/pages 中的 UnwrapRef<PageMeta> 会被替换成 DeepRequired<UnwrapRef<PageMeta>>
 * @param options 选项
 */
interface replaceRouteMetaOptions {
  nuxt: Nuxt;
  resolve: Resolver["resolve"];
}
export function replaceRouteMeta(options: replaceRouteMetaOptions) {
  const { nuxt, resolve } = options;

  const pagesModule = getPagesModule(nuxt, resolve);
  const pagesModuleDts = `${pagesModule}.d.ts`;

  if (
    !grep(/\/\* fast-admin-ignore \*\//, pagesModuleDts).stdout.includes(
      "/* fast-admin-ignore */"
    )
  ) {
    sed(
      "-i",
      /declare module 'vue-router' {/g,
      `/* fast-admin-ignore */
import type { RequiredDeep } from 'type-fest';
declare module 'vue-router' {`,
      pagesModuleDts
    );
    sed(
      "-i",
      /interface RouteMeta extends UnwrapRef<PageMeta> {/g,
      `interface RouteMeta extends RequiredDeep<UnwrapRef<PageMeta>> {`,
      pagesModuleDts
    );
  }
}

/**
 * 获取扁平化的页面列表
 * @param pages 页面列表
 */
export function getFlatPages(pages: NuxtPage[]) {
  return pages.reduce((pages, page) => {
    pages.push(page);
    if (page.children) {
      pages.push(...getFlatPages(page.children));
    }
    return pages;
  }, [] as NuxtPage[]);
}

/**
 * 获取导航父级的 key 列表
 * @description 用于生成 NavParent 的 key 类型
 * @param nuxt Nuxt 实例
 * @returns 导航父级的 key 列表
 */
export function getNavParentKeys(pages: NuxtPage[]) {
  const _pages = getFlatPages(pages);
  return Array.from(
    new Set(
      _pages
        .filter((page) => page.name)
        .map((page) => {
          const parents = page.name!.split("___")[0].split("-");
          parents.pop();
          return parents.join("-") || "$root";
        })
    )
  );
}
