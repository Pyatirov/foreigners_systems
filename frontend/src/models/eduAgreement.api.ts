import { api } from "../api/axios";
import type { TEduAgreement} from "./eduAgreement.interface";

export const getEduAgreements = (): Promise<TEduAgreement[]> =>
  api.get<TEduAgreement[]>("/education_agreements").then(res => res.data);

export const getEduAgreementById = (id: string): Promise<TEduAgreement> =>
  api.get<TEduAgreement>(`/education_agreements/${id}`).then(res => res.data);

export const createEduAgreement = (data: FormData | TEduAgreement): Promise<TEduAgreement> =>
  api.post<TEduAgreement>("/education_agreements", data).then(res => res.data);

export const updateEduAgreement = (id: string, data: FormData | TEduAgreement): Promise<TEduAgreement> =>
  api.patch<TEduAgreement>(`/education_agreements/${id}`, data).then(res => res.data);

export const deleteEduAgreement = (id: string): Promise<void> =>
  api.delete(`/education_agreements/${id}`).then(() => {});