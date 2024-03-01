<template>
  <fs-page>
    <fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
  </fs-page>
</template>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
})

const { $petsFetch } = useNuxtApp();

const { crudRef, crudBinding, crudExpose } = useFs({
  createCrudOptions() {
    return {
      crudOptions: {
        request: {
          async pageRequest() {
            return await $petsFetch("/pet/findByStatus", {
              query: {
                status: "available",
              },
            });
          },
        },
        columns: {
          id: {
            title: "ID",
            width: "50px",
          },
          name: {
            title: "Name",
            width: "200px",
          },
          photoUrls: {
            title: "Photo",
            width: "200px",
          },
          tags: {
            title: "Tags",
            width: "200px",
          },
          status: {
            title: "Status",
            width: "100px",
          },
        },
      },
    };
  },
});

onMounted(() => {
  crudExpose.doRefresh();
});
</script>
