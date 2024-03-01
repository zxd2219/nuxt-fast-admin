<template>
  <n-layout
    has-sider
    class="h-full"
  >
    <n-layout-sider
      ref="sider"
      v-model:collapsed="collapsed"
      collapse-mode="width"
      :collapsed-width="56"
      :width="siderWidth"
      bordered
    >
      <fa-navbar
        v-model:collapsed="collapsed"
        :favicon="appConfig.fastAdmin.favicon"
        :title="appConfig.fastAdmin.title"
      />
      <div
        v-if="!collapsed"
        ref="resizer"
        class="cursor-col-resize absolute !top-0 !bottom-0 -left-4px w-4px bg-gray-200 hover:bg-gray-300"
        :style="{
          left: siderRealTimeWidth - 4 + 'px',
        }"
      />
    </n-layout-sider>
    <n-layout content-style="display: flex; flex-direction: column">
      <n-layout-header>
        <fa-header />
        <fa-tabbar />
      </n-layout-header>
      <n-layout-content
        ref="content"
        content-style="position: relative;"
        bordered
        embedded
      >
        <slot />
        <n-back-top />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import type { NLayoutContent, NLayoutSider } from "naive-ui";
import { useFaStore } from "../stores/fa-store";
import FaHeader from "./components/-fa-header.vue";
import FaNavbar from "./components/-fa-navbar.vue";
import FaTabbar from "./components/-fa-tabbar.vue";

const appConfig = useAppConfig();
const { collapsed, content, siderWidth } = storeToRefs(useFaStore());

// #region 侧边栏宽度调整
const resizer = ref<HTMLElement>();
const sider = ref<InstanceType<typeof NLayoutSider>>();
const { width: siderRealTimeWidth } = useElementSize(sider);
let handler: number;
useDraggable(resizer, {
  onMove(position) {
    cancelAnimationFrame(handler);
    handler = requestAnimationFrame(() => {
      if (position.x <= 200) {
        return false;
      }
      if (position.x >= 400) {
        return false;
      }
      siderWidth.value = position.x;
    });
  },
});
// #endregion
</script>
