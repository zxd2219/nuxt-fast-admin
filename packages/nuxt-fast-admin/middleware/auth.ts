import {
  callWithNuxt,
  defineNuxtRouteMiddleware,
  useNuxtApp,
  useRuntimeConfig,
} from "#app";
import { refresh } from "./auth/func";
import { determineCallbackUrl, navigateToAuthPages } from "./auth/utils/url";

export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtApp = useNuxtApp();
  const authConfig = useRuntimeConfig().public.auth;
  const { status, data, getSession, signIn, refreshToken } = useAuth();
  const localePath = nuxtApp.$localePath as ReturnType<typeof useLocalePath>;

  if (
    status.value === "unauthenticated" &&
    authConfig.provider.type === "refresh" &&
    refreshToken.value
  ) {
    await callWithNuxt(nuxtApp, refresh);
    await callWithNuxt(nuxtApp, getSession);
  }

  const metaAuth =
    typeof to.meta.auth === "object"
      ? {
          unauthenticatedOnly: !to.meta.auth.authenticatedPermissions,
          ...to.meta.auth,
        }
      : to.meta.auth;

  if (metaAuth === false) {
    return;
  }

  const isGuestMode =
    typeof metaAuth === "object" && metaAuth.unauthenticatedOnly;
  // Guest mode happy path 1: Unauthenticated user is allowed to view page
  if (isGuestMode && status.value === "unauthenticated") {
    if (metaAuth.navigateUnauthenticatedTo) {
      return navigateTo(localePath(metaAuth.navigateUnauthenticatedTo));
    }
    return;
  }

  // Guest mode edge-case: Developer used guest-mode config style but set `unauthenticatedOnly` to `false`
  if (typeof metaAuth === "object" && !metaAuth.unauthenticatedOnly) {
    const authenticatedPermissions = [metaAuth.authenticatedPermissions]
      .flat()
      .filter(Boolean);
    // Block access if the user does not have the required permissions
    if (
      authenticatedPermissions.some(
        (permission) => !data.value?.permissions?.includes(permission)
      )
    ) {
      return navigateTo(localePath(metaAuth.navigateAuthenticatedTo ?? "/"));
    }
    return;
  }

  if (status.value === "authenticated") {
    // Guest mode happy path 2: Authenticated user should be directed to another page
    if (isGuestMode) {
      return navigateTo(localePath(metaAuth.navigateAuthenticatedTo ?? "/"));
    }
    return;
  }

  // We do not want to block the login page when the local provider is used
  if (authConfig.provider?.type === "local") {
    const loginRoute: string | undefined = authConfig.provider?.pages?.login;
    if (loginRoute && loginRoute === to.path) {
      return;
    }
  }

  /**
   * We do not want to enforce protection on `404` pages (unless the user opts out of it by setting `allow404WithoutAuth: false`).
   *
   * This is to:
   * - improve UX and DX: Having to log-in to see a `404` is not pleasent,
   * - avoid the `Error [ERR_HTTP_HEADERS_SENT]`-error that occurs when we redirect to the sign-in page when the original to-page does not exist. Likely related to https://github.com/nuxt/framework/issues/9438
   *
   */
  const globalAppMiddleware = authConfig.globalAppMiddleware;
  if (
    globalAppMiddleware === true ||
    (typeof globalAppMiddleware === "object" &&
      // @ts-ignore
      globalAppMiddleware.allow404WithoutAuth)
  ) {
    const matchedRoute = to.matched.length > 0;
    if (!matchedRoute) {
      // Hands control back to `vue-router`, which will direct to the `404` page
      return;
    }
  }

  if (authConfig.provider.type === "authjs") {
    const signInOptions: Parameters<typeof signIn>[1] = {
      error: "SessionRequired",
      callbackUrl: determineCallbackUrl(authConfig, () => to.fullPath),
    };
    // @ts-ignore This is valid for a backend-type of `authjs`, where sign-in accepts a provider as a first argument
    return signIn(undefined, signInOptions) as ReturnType<
      typeof navigateToAuthPages
    >;
  } else if (
    typeof metaAuth === "object" &&
    metaAuth.navigateUnauthenticatedTo
  ) {
    return navigateTo(localePath(metaAuth.navigateUnauthenticatedTo));
  } else {
    return navigateTo(localePath(authConfig.provider.pages.login));
  }
});
