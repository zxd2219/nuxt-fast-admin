export default defineNuxtPlugin({
  hooks: {
    "fast-crud:setup": (options) => {
      options.commonOptions = (props) => {
        return {
          request: {
            transformRes({ res }) {
              return {
                currentPage: 1,
                pageSize: 99999,
                records: res,
                total: res.length,
              } as any;
            },
          },
        };
      };
    },
    "fast-admin:auth:forget": () => {
      console.log("forget");
    },
  },
});
