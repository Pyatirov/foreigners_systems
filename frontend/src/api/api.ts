import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from '../store/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const isRefreshRequest = error.config?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !error.config._retry && !isRefreshRequest) {
      error.config._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);
      } catch {
        clearAccessToken();
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
      }
    }

    return Promise.reject(error);
  }
);

