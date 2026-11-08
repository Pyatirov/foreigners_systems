import { api } from "./axios";

export type DocumentStatus = "active" | "archived" | "revoked";

export type DocumentRecord = {
  id: string;
  studentId: string;
  studentName: string;
  documentTypeId: string;
  typeCode: string;
  typeName: string;
  series: string | null;
  number: string | null;
  issuedDate: string | null;
  expiryDate: string | null;
  scanUrl: string | null;
  notes: string | null;
  uploadedAt: string;
  status: DocumentStatus;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type DocumentListResponse = {
  items: DocumentRecord[];
  total: number;
};

export type DocumentQuery = Record<string, string | number>;
export type DocumentPayload = Record<string, unknown>;

export const documentApi = {
  getAll: async (params: DocumentQuery): Promise<DocumentListResponse> => {
    const response = await api.get<DocumentListResponse>("/documents", { params });
    return response.data;
  },

  getById: async (id: string): Promise<DocumentRecord> => {
    const response = await api.get<DocumentRecord>(`/documents/${id}`);
    return response.data;
  },

  create: async (payload: DocumentPayload): Promise<DocumentRecord> => {
    const response = await api.post<DocumentRecord>("/documents", payload);
    return response.data;
  },

  update: async (id: string, payload: DocumentPayload): Promise<DocumentRecord> => {
    const response = await api.patch<DocumentRecord>(`/documents/${id}`, payload);
    return response.data;
  },

  archive: async (id: string): Promise<DocumentRecord> => {
    const response = await api.patch<DocumentRecord>(`/documents/${id}/archive`);
    return response.data;
  },
};
