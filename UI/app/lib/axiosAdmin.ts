import axios from "axios";

const httpAdmin = axios.create({
  baseURL:
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Xử lý tự động refresh adminAccessToken khi hết hạn
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(null);
  });
  failedQueue = [];
};

httpAdmin.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalReq = error.config;

    if (
      error.response?.status === 401 &&
      !originalReq._retry &&
      !originalReq.url.includes("/auth/admin/refresh-token")
    ) {
      // Nếu đang refresh → queue lại
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => httpAdmin(originalReq));
      }

      originalReq._retry = true;
      isRefreshing = true;

      try {
        // Gọi đúng endpoint refresh của admin
        await httpAdmin.post("/auth/admin/refresh-token");

        processQueue(null);
        return httpAdmin(originalReq);
      } catch (err) {
        processQueue(err);
        // window.location.href = "/administrator/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default httpAdmin;
