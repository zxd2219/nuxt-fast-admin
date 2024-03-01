export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const path = url.pathname.split("/").slice(-1)[0];
  switch (path) {
    case "login":
      return {
        token: "token",
        refreshToken: "refreshToken",
      };
    case "logout":
      return {
        message: "logout",
      };
    case "refresh":
      return {
        token: "token",
        refreshToken: "refreshToken",
      };
    case "session":
      return {
        id: "id",
        name: "name",
        email: "email",
        avatar: "avatar",
        permissions: ["admin"],
      };

    default:
      break;
  }
});
