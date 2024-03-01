<template>
  <div class="w-full h-full">
    <div
      class="flex items-center h-15"
      :class="{ 'justify-center': collapsed }"
    >
      <img
        :class="{ 'ml-16px': !collapsed }"
        :src="favicon"
        class="w-10"
        alt="logo"
      >
      <h2
        v-show="!collapsed"
        class="flex-1 text-center"
      >
        {{ title }}
      </h2>
    </div>
    <n-menu
      :value="value"
      :collapsed="collapsed"
      :options="options"
      :render-icon="renderIcon"
      :render-label="renderLabel"
      :root-indent="16"
      accordion
    />
  </div>
</template>

<script setup lang="ts">
import { useFaMenus } from '../../composables/fast-admin';

defineProps<{
  title: string;
  favicon: string;
}>();
defineModel<boolean>("collapsed");

const { value, options, renderIcon, renderLabel } = useFaMenus();
</script>
