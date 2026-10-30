import axios from "axios";
import { API_BASE_URL } from "./constants";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true, // Sends and receives HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Bearer token to all outgoing requests if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cf_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ignore 401s on auth endpoints
    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/google") ||
      originalRequest?.url?.includes("/auth/forgot-password") ||
      originalRequest?.url?.includes("/auth/reset-password") ||
      originalRequest?.url?.includes("/auth/verify-reset-token");

    // If users/me fails and user had no token stored, don't attempt refresh loop
    const isUsersMeWithoutToken =
      originalRequest?.url?.includes("/users/me") && !localStorage.getItem("cf_token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute &&
      !isUsersMeWithoutToken
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem("cf_refresh_token");

      try {
        const response = await api.post("/auth/refresh", {
          refresh_token: storedRefreshToken || undefined,
        });
        const newAccessToken = response.data?.access_token;
        if (newAccessToken) {
          localStorage.setItem("cf_token", newAccessToken);
          if (response.data?.refresh_token) {
            localStorage.setItem("cf_refresh_token", response.data.refresh_token);
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
        }
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("cf_token");
        localStorage.removeItem("cf_refresh_token");

        // Only redirect to login if on a protected route
        const currentPath = window.location.pathname;
        const isAuthOrPublic =
          currentPath === "/" ||
          currentPath.startsWith("/auth/");

        if (!isAuthOrPublic) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
