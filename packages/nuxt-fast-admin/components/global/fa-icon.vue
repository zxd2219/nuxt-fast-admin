<template>
  <n-icon :="$props">
    <Icon :name="name" />
  </n-icon>
</template>

<script setup lang="ts">
import { iconProps } from "naive-ui";

defineProps({
  ...iconProps,
  name: {
    type: String,
    required: true
  }
});
</script>
