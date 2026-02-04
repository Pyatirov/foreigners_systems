import { api } from "./axios";
import type { TArrivalNotice } from "../types/arrivalNotice";

export const getArrivalNotices = (): Promise<TArrivalNotice[]> =>
  api.get<TArrivalNotice[]>("/arrival_notifications").then(res => res.data);

export const getArrivalNoticeById = (id: string): Promise<TArrivalNotice> =>
  api.get<TArrivalNotice>(`/arrival_notifications/${id}`).then(res => res.data);

export const createArrivalNotice = (data: FormData | TArrivalNotice): Promise<TArrivalNotice> =>
  api.post<TArrivalNotice>("/arrival_notifications", data).then(res => res.data);

export const updateArrivalNotice = (id: string, data: FormData | TArrivalNotice): Promise<TArrivalNotice> =>
  api.patch<TArrivalNotice>(`/arrival_notifications/${id}`, data).then(res => res.data);

export const deleteArrivalNotice = (id: string): Promise<void> =>
  api.delete(`/arrival_notifications/${id}`).then(() => {});