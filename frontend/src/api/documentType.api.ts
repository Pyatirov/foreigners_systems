import { api } from "./axios";

export type DocumentFieldType =
  | "string"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "select";

export type DocumentTypeField = {
  id: string;
  name: string;
  label: string;
  type: DocumentFieldType;
  dataType: string;
  required: boolean;
  sortOrder: number;
  options: unknown[] | Record<string, unknown> | null;
  validation: Record<string, unknown> | null;
  isActive: boolean;
};

export type DocumentType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  templateUrl: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fields: DocumentTypeField[];
};

export type DocumentTypeListResponse = {
  items: DocumentType[];
  total: number;
};

export const documentTypeApi = {
  getAll: async (includeInactive = false): Promise<DocumentTypeListResponse> => {
    const response = await api.get<DocumentTypeListResponse>("/document-types", {
      params: includeInactive ? { includeInactive: true } : undefined,
    });
    return response.data;
  },

  getByCode: async (code: string): Promise<DocumentType> => {
    const response = await api.get<DocumentType>(
      `/document-types/${encodeURIComponent(code)}`
    );
    return response.data;
  },
};
