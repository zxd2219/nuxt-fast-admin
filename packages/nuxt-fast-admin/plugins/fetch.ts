import { FetchError } from "ofetch";

export default defineNuxtPlugin({
  name: "fast-admin:fetch",
  enforce: "pre",
  setup() {
    const {
      public: { openFetch: clients, auth },
    } = useRuntimeConfig();
    const { rawToken } = useAuthState();

    return {
      provide: Object.fromEntries(
        Object.entries(clients).map(([name, options]) => [
          `${name}Fetch`,
          createOpenFetch((localOptions) => ({
            ...options,
            ...localOptions,
            onRequest(ctx) {
              if (rawToken.value) {
                if (!ctx.options.headers) ctx.options.headers = {};
                ctx.options.headers[
                  auth.provider.token.headerName as keyof HeadersInit
                ] = `${auth.provider.token.type} ${rawToken.value}`;
              }
              return localOptions.onRequest?.(ctx);
            },
            onRequestError(ctx) {
              if (!handleError(ctx.error, ctx.options.error)) return;
              return localOptions.onRequestError?.(ctx);
            },
            onResponseError(ctx) {
              const error = new FetchError("Response Error");
              error.statusCode = ctx.response.status;
              error.statusMessage = ctx.response.statusText;
              error.response = ctx.response;
              if (!handleError(error, ctx.options.error)) return;
              return localOptions.onResponseError?.(ctx);
            },
          })),
        ])
      ),
    };
  },
});
