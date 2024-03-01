export default defineAppConfig({
  fastAdmin: {
    theme: "auto",
    title: "Fast Admin",
    favicon: "/favicon.ico",
    description: "Fast Admin",
  },
});

declare module "@nuxt/schema" {
  interface AppConfigInput {
    fastAdmin: {
      /**
       * 网站主题
       */
      theme: "auto" | "dark" | "light";
      /**
       * 网站标题
       */
      title: string;
      /**
       * 网站图标
       */
      favicon: string;
      /**
       * 网站描述
       */
      description: string;
    };
  }
}
