export default defineNuxtPlugin({
  name: "fast-admin:auth",
  enforce: "pre",
  setup() {
    let beforeTime = 0;
    const remember = useCookie("auth:remember");
    const { rawRefreshToken } = useAuthState();
    useEventListener("unload", () => {
      if (new Date().getTime() - beforeTime < 100) {
        if (!remember.value) {
          rawRefreshToken.value = null;
        }
      }
    });
    useEventListener("beforeunload", () => {
      beforeTime = new Date().getTime();
    });
  },
});
