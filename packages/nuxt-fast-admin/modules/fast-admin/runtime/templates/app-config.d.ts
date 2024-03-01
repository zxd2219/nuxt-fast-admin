import type { HTMLAttributes } from "vue";

interface PageKeyOption {
  key: /* fast-admin-page-key */ string;
}
interface AnyKeyOption {
  key: string;
}
type MenuKeyOption = PageKeyOption | AnyKeyOption;

interface MenuDividerOptionInput {
  type: "divider";
  props?: HTMLAttributes;
}
interface MenuGroupOptionInput extends Omit<NavMeta, "has"> {
  type: "group";
  children?: Array<_MenuOptionInput | MenuGroupOptionInput>;
}
interface _MenuOptionInput extends Omit<NavMeta, "has"> {
  type?: undefined;
  extra?: string;
  children?: Array<_MenuOptionInput | MenuGroupOptionInput>;
}

type MenuOptionInput =
  | (_MenuOptionInput & MenuKeyOption)
  | (MenuGroupOptionInput & MenuKeyOption)
  | (MenuDividerOptionInput & Partial<AnyKeyOption>);

declare module "nuxt/schema" {
  interface AppConfigInput {
    /**
     * 导航父级 (菜单)
     */
    menus?: Array<MenuOptionInput>;
  }
}

declare module "@nuxt/schema" {
  interface AppConfigInput {
    /**
     * 导航父级 (菜单)
     */
    menus?: Array<MenuOptionInput>;
  }
}
