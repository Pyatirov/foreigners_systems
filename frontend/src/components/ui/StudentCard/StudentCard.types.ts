// types/student.card.types.ts
export interface StudentData {
  _id: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  birthdate: string;
  country?: string;
  sex?: boolean;
  photoUrl?: string;
}

export interface DocumentStatus {
  type: string;
  exists: boolean;
  url?: string;
  createUrl?: string;
}

export const DOC_TYPES = [
  { name: "Удостоверение личности", api: "/api/passports" },
  { name: "Виза",                   api: "/api/visas" },
  { name: "Документ об образовании", api: "/api/education_documents" },
  { name: "Ходатайство",            api: "/api/petitions" },
  { name: "Медицинское заключение", api: "/api/medical_reports" },
  { name: "Миграционная карта",     api: "/api/migration_cards" },
  { name: "Уведомление о прибытии", api: "/api/arrival_notifications" },
  { name: "Договор об образовании", api: "/api/education_agreements" },
  { name: "Уведомление о расторжении", api: "/api/termination_notifications" },
] as const;