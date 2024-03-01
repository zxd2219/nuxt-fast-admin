import type { MenuOptionInput } from "#build/types/fa-app-config";
import { FaIcon, NTooltip, NuxtLink } from "#components";
import type { RouteLocationNormalized, RouteMeta } from "#vue-router";
import type { MenuMixedOption } from "naive-ui/lib/menu/src/interface";

// #region 全局状态
// #region 菜单配置
/**
 * 获取填充了 Meta 的菜单选项
 * @param option 菜单选项
 * @param t 翻译函数
 * @param locale 语言
 * @returns 菜单选项
 */
function getMenusWithMeta(
  menus: Array<MenuOptionInput>,
  i18n: ReturnType<typeof useI18n> = useNuxtApp().$i18n
): Array<MenuMixedOption> {
  const menuss = [menus];
  for (const menus of menuss) {
    for (const menu of menus) {
      const { show = true, disabled = false } =
        menu.type === "divider" ? {} : menu;

      let title: string | undefined;
      let order: number | undefined;
      let description: string | undefined;
      if (menu.type !== "divider") {
        title = menu.title;
        order = menu.order;
        description = menu.description;
        delete menu.title;
        delete menu.order;
        delete menu.description;
      }

      Object.assign(menu, {
        ...menu,
        show,
        disabled,
        meta: normalizeRouteMeta(
          {
            name: `${menu.key}___${i18n.locale.value}`,
            meta: {
              title,
              description,
              nav: {
                show,
                title,
                disabled,
                description,
                order,
              },
            },
          },
          {
            type: "menu",
            i18n,
          }
        ),
      });
      if (menu.type === "divider" || !menu.children) continue;
      menuss.push(menu.children as Array<MenuOptionInput>);
    }
  }

  return menus as Array<MenuMixedOption>;
}

/**
 * 菜单排序
 * @param a a
 * @param b b
 * @returns 排序
 */
function sortMenuOption(a: MenuMixedOption, b: MenuMixedOption) {
  const aMeta = a.meta as RouteMeta;
  const bMeta = b.meta as RouteMeta;
  return (aMeta?.nav?.order ?? 0) - (bMeta?.nav?.order ?? 0);
}

export const useFaMenus = createSharedComposable(() => {
  const router = useRouter();
  const { menus } = useAppConfig();
  const { locale } = useNuxtApp().$i18n as ReturnType<typeof useI18n>;

  const value = computedEager<string>(
    () => (router.currentRoute.value.name as string).split("___")[0]
  );

  const paths = ref(new Map()) as Ref<
    Map<string | number, Array<MenuMixedOption>>
  >;
  const options = ref([]) as Ref<Array<MenuMixedOption>>;

  // #region 副作用监听
  watchEffect(() => {
    paths.value = new Map();
    options.value =
      // 将菜单选项嵌入但基础菜单中并设置父级
      router
        .getRoutes()
        // 过滤出当前语言的路由
        .filter((route) => (route.name as string).endsWith(locale.value))
        // 过滤出 default 布局的路由
        .filter((route) =>
          ["default"].includes(route.meta.layout || ("default" as string))
        )
        // 将路由转换为菜单选项附带 route
        .map<MenuMixedOption>((route) => ({
          key: (route.name as string).split("___")[0],
          show: route.meta.nav.show,
          disabled: route.meta.nav.disabled,
          meta: route.meta,
        }))
        .reduce<Array<MenuMixedOption>>((acc, cur) => {
          const meta = cur.meta as RouteMeta;
          const keys = meta.nav.parent.split("-");

          let menus = acc;
          // 遍历每一层父级路径
          for (let i = 0; i < keys.length; i++) {
            let canContinue = true;
            // 遍历该层父级路径对应的所有菜单
            for (let j = 0; j < menus.length; j++) {
              const menu = menus[j];
              // 如果正在遍历的菜单是分隔线，跳过
              if (menu.type === "divider") continue;
              // 如果正在遍历的菜单和父级路径匹配
              if (menu.key === keys.slice(0, i + 1).join("-")) {
                paths.value.set(cur.key!, [
                  ...(paths.value.get(cur.key!) || []),
                  menu,
                ]);
                // 如果父级路径是最后一层
                if (i === keys.length - 1) {
                  paths.value.set(cur.key!, [
                    ...(paths.value.get(cur.key!) || []),
                    cur,
                  ]);
                  menu.children = [...((menu.children as any) ?? []), cur];
                  return acc;
                }
                // 如果父级路径不是最后一层且没有子菜单, 则不再向下查找
                if (!menu.children) {
                  canContinue = false;
                  break;
                }
                // 如果父级路径不是最后一层且有子菜单，继续向下查找
                menus = menu.children as Array<MenuMixedOption>;
                // 跳出本层查找
                break;
              }
            }
            // 如果没法向下查找, 则退出循环
            if (!canContinue) break;
          }
          paths.value.set(cur.key!, [cur]);
          return [...acc, cur];
        }, getMenusWithMeta(useClone(menus)))
        // 给菜单排序
        .reduce<Array<MenuMixedOption>>((acc, cur) => {
          const menuss = [[cur]];
          for (const menus of menuss) {
            for (const menu of menus) {
              if (!(menu as any).children) continue;
              menuss.push((menu.children as any).sort(sortMenuOption));
            }
          }
          return [...acc, cur].sort(sortMenuOption);
        }, new Array<MenuMixedOption>());
  });
  // #endregion

  /**
   * 渲染图标
   * @param option 菜单选项
   * @returns 图标
   */
  function renderIcon(option: MenuMixedOption) {
    const meta = option.meta as RouteMeta;
    const icon =
      meta?.nav?.icon ??
      meta?.icon ??
      (meta?.nav?.title ?? meta?.title ?? "")[0];
    return <FaIcon name={icon} />;
  }

  /**
   * 渲染标签
   * @param option 菜单选项
   * @returns 标签
   */
  function renderLabel(option: MenuMixedOption) {
    const meta = option.meta as RouteMeta;
    const title = meta?.nav?.title ?? meta?.title ?? "";
    const description = meta?.nav?.description ?? meta?.description ?? "";

    const LinkElement =
      meta?.type === "page" ? (
        <NuxtLink to={{ name: `${meta.name}___${meta.lang}` }}>
          {title}
        </NuxtLink>
      ) : (
        title
      );

    return description ? (
      <NTooltip trigger="hover">
        {{
          trigger: () => LinkElement,
          default: () => description,
        }}
      </NTooltip>
    ) : (
      LinkElement
    );
  }

  return { value, paths, options, renderIcon, renderLabel };
});
// #endregion
// #region 历史配置
export const useFaHistories = createSharedComposable(() => {
  const router = useRouter();
  const histories = ref([]) as Ref<Array<RouteLocationNormalized>>;

  const value = computedEager<string>(
    () => (router.currentRoute.value.name as string).split("___")[0]
  );

  const addHistory = (route: RouteLocationNormalized) => {
    const index = histories.value.findIndex(
      (_route) => _route.name === route.name
    );
    if (index !== -1) histories.value.splice(index, 1, route);
    else histories.value.push(route);
  };

  const removeHistory = (route: RouteLocationNormalized) => {
    const index = histories.value.findIndex(
      (_route) => _route.name === route.name
    );
    if (index !== -1) histories.value.splice(index, 1);
  };

  const clearHistories = () => {
    histories.value = [];
  };

  router.afterEach(addHistory);
  router.isReady().then(() => addHistory(router.currentRoute.value));

  return { value, histories, removeHistory, clearHistories };
});
// #endregion
// #endregion
