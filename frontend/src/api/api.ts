import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from '../store/auth.store';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
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
  res => res,
  async error => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const res = await api.post('/auth/refresh');
        setAccessToken(res.data.accessToken);

        original.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(original);
      } catch {
        clearAccessToken();
      }
    }

    return Promise.reject(error);
  }
);

