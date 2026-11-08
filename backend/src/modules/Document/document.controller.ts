import type { Request, Response } from "express";
import {
  archiveDocument as archiveDocumentRecord,
  createDocument as createDocumentRecord,
  DocumentConflictError,
  DocumentNotFoundError,
  DocumentValidationError,
  findDocumentById,
  listDocuments,
  updateDocument as updateDocumentRecord,
} from "@/modules/Document/document.service.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function queryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function handleError(res: Response, error: unknown, context: string): void {
  if (error instanceof DocumentValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }

  if (error instanceof DocumentNotFoundError) {
    res.status(404).json({ message: error.message });
    return;
  }

  if (error instanceof DocumentConflictError) {
    res.status(409).json({ message: error.message });
    return;
  }

  const dbError = error as { code?: string; message?: string };
  if (["22P02", "22007", "22008", "23502", "23503", "23514"].includes(dbError?.code ?? "")) {
    res.status(400).json({ message: "Некорректные данные документа" });
    return;
  }

  if (dbError?.code === "23505") {
    res.status(409).json({ message: "Запись конфликтует с существующими данными" });
    return;
  }

  console.error(`${context}:`, error);
  res.status(500).json({ message: "Внутренняя ошибка сервера" });
}

export async function getDocuments(req: Request, res: Response): Promise<void> {
  try {
    const result = await listDocuments({
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 10),
      search: queryString(req.query.search),
      type: queryString(req.query.type) ?? queryString(req.query.typeCode),
      studentId: queryString(req.query.studentId) ?? queryString(req.query.student_id),
      status: queryString(req.query.status),
    });
    res.json(result);
  } catch (error) {
    handleError(res, error, "GET /api/documents failed");
  }
}

export async function getDocumentById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: "Некорректный идентификатор документа" });
    return;
  }

  try {
    const document = await findDocumentById(id);
    if (!document) {
      res.status(404).json({ message: "Документ не найден" });
      return;
    }
    res.json(document);
  } catch (error) {
    handleError(res, error, "GET /api/documents/:id failed");
  }
}

export async function createDocument(req: Request, res: Response): Promise<void> {
  try {
    const document = await createDocumentRecord(req.body as Record<string, unknown>);
    res.status(201).json(document);
  } catch (error) {
    handleError(res, error, "POST /api/documents failed");
  }
}

export async function updateDocument(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: "Некорректный идентификатор документа" });
    return;
  }

  try {
    const document = await updateDocumentRecord(id, req.body as Record<string, unknown>);
    if (!document) {
      res.status(404).json({ message: "Документ не найден" });
      return;
    }
    res.json(document);
  } catch (error) {
    handleError(res, error, "PATCH /api/documents/:id failed");
  }
}

export async function archiveDocument(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: "Некорректный идентификатор документа" });
    return;
  }

  try {
    const document = await archiveDocumentRecord(id);
    if (!document) {
      res.status(404).json({ message: "Документ не найден" });
      return;
    }
    res.json(document);
  } catch (error) {
    handleError(res, error, "PATCH /api/documents/:id/archive failed");
  }
}
