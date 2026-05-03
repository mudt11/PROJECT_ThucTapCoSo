import http from "@/app/lib/http";

export const loginAdminApi = (username: string, password: string) =>
  http.post(
    "/auth/admin/login",
    { username, password },
    {
      headers: { "x-type-auth": "admin" },
    },
  );

export const logoutAdminApi = () =>
  http.post("/auth/admin/logout", { headers: { "x-type-auth": "admin" } });

export const getCurrentAdminApi = () =>
  http.get("/users/admin/me", { headers: { "x-type-auth": "admin" } });
