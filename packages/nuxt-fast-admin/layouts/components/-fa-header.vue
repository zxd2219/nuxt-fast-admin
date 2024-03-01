<template>
  <n-space
    class="h-12 px-4 shadow relative z-1 bg-white"
    align="center"
    justify="space-between"
  >
    <n-space
      align="center"
      item-style="display: flex; align-items: center"
    >
      <n-tooltip>
        <template #trigger>
          <n-button
            text
            @click="collapsed = !collapsed"
          >
            <fa-icon
              :size="18"
              :name="!collapsed ? 'ep:fold' : 'ep:expand'"
            />
          </n-button>
        </template>
        {{ collapsed ? "展开侧边栏" : "收起侧边栏" }}
      </n-tooltip>
      <n-tooltip>
        <template #trigger>
          <n-button
            text
            @click="reloadNuxtApp()"
          >
            <fa-icon
              :size="18"
              name="ep:refresh-right"
            />
          </n-button>
        </template>
        刷新应用
      </n-tooltip>
      <n-breadcrumb>
        <n-breadcrumb-item :clickable="false">
          <n-popover
            trigger="hover"
            class="!p-0"
          >
            <template #trigger>
              <v-node
                :node="
                  renderBreadcrumbItem({
                    meta: {
                      title: $t('menus.$root.title'),
                    },
                  })
                "
              />
            </template>
            <n-menu
              :value="value"
              :options="menuOptions"
              :render-icon="renderIcon"
              :render-label="renderLabel"
              :root-indent="16"
              accordion
            />
          </n-popover>
        </n-breadcrumb-item>
        <n-breadcrumb-item
          v-for="menu in menus"
          :key="menu.key"
          :clickable="false"
        >
          <n-popover
            v-if="menu.children"
            trigger="hover"
            class="!p-0"
          >
            <template #trigger>
              <v-node :node="renderBreadcrumbItem(menu)" />
            </template>
            <n-menu
              :value="value"
              :options="(menu as any).children"
              :render-icon="renderIcon"
              :render-label="renderLabel"
              :root-indent="16"
              accordion
            />
          </n-popover>
          <v-node
            v-else
            :node="renderBreadcrumbItem(menu)"
          />
        </n-breadcrumb-item>
      </n-breadcrumb>
    </n-space>
    <n-space
      align="center"
      item-style="display: flex; align-items: center"
    >
      <n-dropdown
        trigger="hover"
        :options="localeOptions"
        @select="switchLocale"
      >
        <n-button text>
          <!-- {{ localeCode.getLanguageNativeName(locale) }} -->
        </n-button>
      </n-dropdown>
      <n-tooltip>
        <template #trigger>
          <n-button
            text
            @click="toggleAppFullscreen"
          >
            <fa-icon
              :size="20"
              :name="
                isAppFullscreen
                  ? 'ant-design:fullscreen-exit-outlined'
                  : 'ant-design:fullscreen-outlined'
              "
            />
          </n-button>
        </template>
        {{ isAppFullscreen ? "退出全屏" : "应用全屏" }}
      </n-tooltip>
      <n-dropdown
        trigger="hover"
        :options="userDropdownOptions"
      >
        <n-avatar
          round
          size="medium"
        >
          <icon name="管" />
        </n-avatar>
      </n-dropdown>
    </n-space>
  </n-space>
</template>

<script setup lang="tsx">
import { NButton } from "naive-ui";
import type { DropdownMixedOption } from "naive-ui/es/dropdown/src/interface";
import type { MenuMixedOption } from "naive-ui/es/menu/src/interface";
import { useFaMenus } from "../../composables/fast-admin";
import { useFaStore } from "../../stores/fa-store";

const route = useRoute();
const localePath = useLocalePath();
const { collapsed } = storeToRefs(useFaStore());
const {
  value,
  paths,
  options: menuOptions,
  renderIcon,
  renderLabel,
} = useFaMenus();

// #region 面包屑
const menus = computedEager(
  () => paths.value.get((route.name as string).split("___")[0]) ?? []
);

const renderBreadcrumbItem = (menu: MenuMixedOption) => {
  return (
    <div class="flex gap-2 items-center text-4 cursor-pointer">
      {renderIcon(menu)}
      {renderLabel(menu)}
    </div>
  );
};
// #endregion

// #region 语言切换
const { availableLocales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const localeOptions = computedEager(() =>
  availableLocales.map((locale) => ({
    // label: localeCode?.getLanguageNativeName(locale),
    key: locale,
  }))
);

function switchLocale(locale: string) {
  navigateTo(switchLocalePath(locale));
}
// #endregion

// #region 应用全屏切换
const { isFullscreen: isAppFullscreen, toggle: toggleAppFullscreen } =
  useFullscreen();

onKeyStroke("F11", (e) => {
  toggleAppFullscreen();
  e.preventDefault();
});
// #endregion

// #region 用户菜单
const logout = () => {
  navigateTo(localePath("/auth"));
};
const userDropdownOptions: Array<DropdownMixedOption> = [
  {
    type: "render",
    render: () => <NButton onClick={logout}>退出登录</NButton>,
  },
];
// #endregion
</script>

<style scoped>
:deep(.n-breadcrumb > ul) {
  display: flex;
}
</style>
