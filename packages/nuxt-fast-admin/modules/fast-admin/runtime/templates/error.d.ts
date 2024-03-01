import "#app";

export type ErrorHandler = "message" | "dialog" | "notify" | "global" | "none";
export type ErrorLevel = "info" | "success" | "warning" | "error";
declare module "#app" {
  interface NuxtError {
    /**
     * 错误数据
     */
    data?: {
      /**
       * 错误等级
       * @default error
       */
      level?: "info" | "success" | "warning" | "error";
      /**
       * 错误详情
       */
      detail?: string;
      [key: string]: any;
    };
  }
}
