export default defineNuxtConfig({
  ssr: false,
  extends: [".."],
  openFetch: {
    clients: {
      pets: {
        baseURL: "https://petstore3.swagger.io/api/v3",
        schema: "https://petstore3.swagger.io/api/v3/openapi.json",
      },
      opentcs: {
        baseURL: "http://127.0.0.1:55200/v1",
        schema: "./opentcs.json",
      },
    },
  },
  fastAdmin: {
    pages: {
      auth: {
        forgot: false,
      },
    },
  },
});
