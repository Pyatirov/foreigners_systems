import { api } from "./axios";
import type { TMedicalReport } from "../types/medicalReport";

export const getMedicalReports = (): Promise<TMedicalReport[]> =>
  api.get<TMedicalReport[]>("/medical_reports").then(res => res.data);

export const getMedicalReportById = (id: string): Promise<TMedicalReport> =>
  api.get<TMedicalReport>(`/medical_reports/${id}`).then(res => res.data);

export const createMedicalReport = (data: FormData | TMedicalReport): Promise<TMedicalReport> =>
  api.post<TMedicalReport>("/medical_reports", data).then(res => res.data);

export const updateMedicalReport = (id: string, data: FormData | TMedicalReport): Promise<TMedicalReport> =>
  api.patch<TMedicalReport>(`/medical_reports/${id}`, data).then(res => res.data);

export const deleteMedicalReport = (id: string): Promise<void> =>
  api.delete(`/medical_reports/${id}`).then(() => {});