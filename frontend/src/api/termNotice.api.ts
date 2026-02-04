import { api } from "./axios";
import type { TTermNotice} from "../types/termNotice";

export const getTermNotices = (): Promise<TTermNotice[]> =>
  api.get<TTermNotice[]>("/termination_notifications").then(res => res.data);

export const getTermNoticeById = (id: string): Promise<TTermNotice> =>
  api.get<TTermNotice>(`/termination_notifications/${id}`).then(res => res.data);

export const createTermNotice = (data: FormData | TTermNotice): Promise<TTermNotice> =>
  api.post<TTermNotice>("/termination_notifications", data).then(res => res.data);

export const updateTermNotice = (id: string, data: FormData | TTermNotice): Promise<TTermNotice> =>
  api.patch<TTermNotice>(`/termination_notifications/${id}`, data).then(res => res.data);

export const deleteTermNotice = (id: string): Promise<void> =>
  api.delete(`/termination_notifications/${id}`).then(() => {});