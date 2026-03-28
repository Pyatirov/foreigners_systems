import { api } from "./axios";
import type { EntityApi, Entity } from "../types/entities";

export const createBaseApi = <T extends Entity>(path: string): EntityApi<T> => ({

  getAll: (params?) =>
    api.get<{ items: T[]; total: number }>(path, { params }).then(res => {
      const data = res.data;
      if (Array.isArray(data)) return { items: data, total: data.length };
      return data;
    }),

  getById: (id) =>
    api.get<T>(`${path}/${id}`).then(res => res.data),

  create: (data) =>
    api.post<T>(path, data).then(res => res.data),

  update: (id, data) =>
    api.patch<T>(`${path}/${id}`, data).then(res => res.data),

  delete: (id) =>
    api.delete(`${path}/${id}`).then(() => {}),
});