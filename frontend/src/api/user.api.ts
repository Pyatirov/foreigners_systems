import { api } from "./api";

export const userApi = {
  getAll: async (params?: Record<string, string | number>) => {
    const res = await api.get("/api/users", { params });
    return res.data; // { items: User[], total: number }
  },
  getById: async (id: string) => {
    const res = await api.get(`/api/users/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post("/api/users", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/users/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/users/${id}`);
  },
};