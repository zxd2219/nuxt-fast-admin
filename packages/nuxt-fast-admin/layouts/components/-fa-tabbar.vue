<template>
  <n-tabs
    :value="value"
    :closable="histories.length > 1"
    type="card"
    size="small"
    class="pt-2 px-4 h-47px"
    animated
    @close="closeTab"
    @update:value="openTab"
  >
    <n-tab
      v-for="history in histories"
      :key="(history.name as string)"
      :name="(history.name as string).split('___')[0]"
    >
      <fa-icon
        :size="13"
        :name="history.meta.nav!.icon!"
        class="mr-1"
      />
      {{ history.meta.nav!.title! }}
    </n-tab>
    <template #suffix>
      <n-tooltip>
        <template #trigger>
          <n-button
            text
            @click="togglePageFullscreen"
          >
            <fa-icon
              :size="20"
              :name="
                isPageFullscreen
                  ? 'ic:baseline-fullscreen-exit'
                  : 'ic:baseline-fullscreen'
              "
            />
          </n-button>
        </template>
        {{ isPageFullscreen ? "退出全屏" : "页面全屏" }}
      </n-tooltip>
    </template>
  </n-tabs>
</template>

<script setup lang="ts">
import { useFaHistories } from "../../composables/fast-admin";
import { useFaStore } from "../../stores/fa-store";

const { locale } = useI18n();
const { content } = storeToRefs(useFaStore());
const { value, histories, removeHistory } = useFaHistories();

// #region 页面全屏切换
const { isFullscreen: isPageFullscreen, toggle: togglePageFullscreen } =
  useFullscreen(content);
// #endregion

// #region 标签页切换
const openTab = async (to: string) => {
  await navigateTo({name: `${to}___${locale.value}`});
};

const closeTab = (name: string) => {
  const history = histories.value.find((item) => (item.name as string).split("___")[0] === name);
  if (!history) return;
  removeHistory(history);
};
// #endregion
</script>
