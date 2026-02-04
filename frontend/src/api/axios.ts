import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api", // базовый URL твоих роутов на бэке
  withCredentials: true,               // для cookie и авторизации
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err.response?.data || err)
);
