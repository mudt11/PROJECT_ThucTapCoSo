import http from "@/app/lib/axios";

export const loginAdminApi = (username: string, password: string) =>
  http.post("/auth/admin/login", { username, password });

export const logoutAdminApi = () => http.post("/auth/admin/logout");

export const getCurrentAdminApi = () => http.get("/users/admin/me");
