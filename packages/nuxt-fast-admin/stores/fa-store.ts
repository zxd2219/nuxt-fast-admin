import type { NLayoutContent } from "naive-ui";

export const useFaStore = defineStore(
  "fa",
  () => {
    const collapsed = ref<boolean>(false);
    const siderWidth = ref<number>(272);
    const content = ref<InstanceType<typeof NLayoutContent>>();

    return {
      collapsed,
      siderWidth,
      content,
    };
  },
  {
    persist: {
      paths: ["collapsed", "siderWidth"],
    },
  }
);
