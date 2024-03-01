export default defineNuxtPlugin(async () => {
  const router = useRouter();

  const normalizeRoutesMeta = () => {
    router.getRoutes().forEach((route) => normalizeRouteMeta(route));
  };

  const oldAddRoute = router.addRoute;
  // @ts-ignore
  router.addRoute = function (prantNameOrRoute, route) {
    if (
      typeof prantNameOrRoute === "string" ||
      typeof prantNameOrRoute === "symbol"
    ) {
      return oldAddRoute.call(
        router,
        prantNameOrRoute,
        // @ts-ignore
        normalizeRoutesMeta(route)
      );
    }
    // @ts-ignore
    return oldAddRoute.call(router, normalizeRoutesMeta(prantNameOrRoute));
  };

  await router.isReady();
  normalizeRoutesMeta();
});
