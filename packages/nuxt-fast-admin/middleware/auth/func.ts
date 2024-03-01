import { joinURL } from "ufo";
import { jsonPointerGet } from "./helpers";

export async function refresh() {
  const config = useRuntimeConfig().public.auth.provider;
  const { path, method } = config.endpoints.refresh;

  const { refreshToken, token, rawToken, rawRefreshToken, lastRefreshedAt } =
    useAuthState();

  const headers = new Headers({
    [config.token.headerName]: token.value,
  } as HeadersInit);

  const response = await $fetch<Record<string, any>>(
    joinURL(useAuthState()._internal.baseURL, path),
    {
      method: method as any,
      headers,
      body: {
        refreshToken: refreshToken.value,
      },
    }
  );

  const extractedToken = jsonPointerGet(
    response,
    config.token.signInResponseTokenPointer
  );
  if (typeof extractedToken !== "string") {
    console.error(
      `Auth: string token expected, received instead: ${JSON.stringify(
        extractedToken
      )}. Tried to find token at ${
        config.token.signInResponseTokenPointer
      } in ${JSON.stringify(response)}`
    );
    return;
  }

  if (!config.refreshOnlyToken) {
    const extractedRefreshToken = jsonPointerGet(
      response,
      config.refreshToken.signInResponseRefreshTokenPointer
    );
    if (typeof extractedRefreshToken !== "string") {
      console.error(
        `Auth: string token expected, received instead: ${JSON.stringify(
          extractedRefreshToken
        )}. Tried to find token at ${
          config.refreshToken.signInResponseRefreshTokenPointer
        } in ${JSON.stringify(response)}`
      );
      return;
    } else {
      rawRefreshToken.value = extractedRefreshToken;
    }
  }

  rawToken.value = extractedToken;
  lastRefreshedAt.value = new Date();
}
