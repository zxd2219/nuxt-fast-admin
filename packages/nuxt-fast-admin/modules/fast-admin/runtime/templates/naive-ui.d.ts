import type { RouteMeta } from "#vue-router";
declare module "naive-ui/lib/menu/src/interface" {
  interface MenuOptionSharedPart {
    meta?: RouteMeta;
  }
}
