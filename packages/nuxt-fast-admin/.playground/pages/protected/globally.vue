<template>
  <div>
    <p>globally</p>
    <n-button @click="test"> test </n-button>
    <n-button @click="$router.push('/12')"> test1 </n-button>
    <n-button @click="test2"> test2 </n-button>
    <n-button @click="logout"> signout </n-button>
    <NuxtLink
      v-for="locale in availableLocales"
      :key="locale.code"
      :to="switchLocalePath(locale.code)"
    >
      {{ locale.name }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: false,
    authenticatedPermissions: ["admin"],
  },
  middleware: ["auth"],
});

console.log(1111);


function test() {
  throw new Error("test");
}

const { $opentcsFetch } = useNuxtApp();

async function test2() {
  try {
    await $opentcsFetch("/vehicles/{NAME}", {
      path: {
        NAME: "test",
      },
    });
  } catch (error) {
    console.log(error);
  }
}

const { signOut } = useAuth();
const localePath = useLocalePath();

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});

const logout = () => {
  signOut({
    callbackUrl: localePath("/"),
  });
};
</script>
