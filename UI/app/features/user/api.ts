import http from "@/app/lib/axios";

export const getCurrentUserApi = () => http.get("/users/me");

export const uploadAvatarApi = (formData: FormData) =>
  http.post("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
