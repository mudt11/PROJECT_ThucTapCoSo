import http from "@/app/lib/axios";

export const getCurrentUserApi = () => http.get("/users/me");
