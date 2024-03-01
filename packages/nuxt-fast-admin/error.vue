<template>
  <fa-error
    global
    :error="error"
    @clear-error="clearError"
  />
</template>

<script setup lang="ts">
import type FaError from "./components/global/fa-error.vue";

defineProps<{
  error: InstanceType<typeof FaError>["$props"]["error"]
}>();
</script>
