import type { Request, Response } from "express";
import {
  createDocumentType,
  createDocumentTypeField,
  deactivateDocumentType,
  deactivateDocumentTypeField,
  DocumentTypeServiceError,
  findDocumentTypeByCode,
  listDocumentTypes,
  normalizeFieldDataType,
  updateDocumentType,
  updateDocumentTypeField,
} from "@/modules/DocumentType/documentType.service.js";
import type {
  CreateDocumentTypeFieldInput,
  CreateDocumentTypeInput,
  UpdateDocumentTypeFieldInput,
  UpdateDocumentTypeInput,
} from "@/modules/DocumentType/documentType.service.js";

const TYPE_CODE_RE = /^[a-z][a-z0-9_-]{0,99}$/;
const FIELD_KEY_RE = /^[a-z][a-z0-9_]{0,99}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sendError(res: Response, error: unknown, context: string): void {
  if (error instanceof DocumentTypeServiceError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  const pgError = error as { code?: string; constraint?: string; message?: string };
  if (pgError?.code === "23505") {
    res.status(409).json({ message: "Тип документа или поле с таким кодом уже существует" });
    return;
  }
  if (pgError?.code === "23503" || pgError?.code === "23514") {
    res.status(409).json({ message: "Операция конфликтует с ограничениями базы данных" });
    return;
  }

  console.error(`${context}:`, error);
  res.status(500).json({ message: "Внутренняя ошибка при работе с типами документов" });
}

function getCode(req: Request, res: Response): string | null {
  const code = req.params.code?.trim().toLowerCase();
  if (!code || !TYPE_CODE_RE.test(code)) {
    res.status(400).json({ message: "Некорректный код типа документа" });
    return null;
  }
  return code;
}

function parseIncludeInactive(value: unknown): boolean {
  return value === "true";
}

function readText(
  value: unknown,
  _fieldName: string,
  options: { min?: number; max?: number } = {}
): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length < (options.min ?? 1) || normalized.length > (options.max ?? 500)) {
    return null;
  }
  return normalized;
}

function validNullableText(value: unknown, max = 2000): value is string | null {
  return value === null || (typeof value === "string" && value.length <= max);
}

export async function getDocumentTypes(req: Request, res: Response): Promise<void> {
  try {
    const items = await listDocumentTypes({
      includeInactive: parseIncludeInactive(req.query.includeInactive),
    });
    res.json({ items, total: items.length });
  } catch (error) {
    sendError(res, error, "GET /api/document-types failed");
  }
}

export async function getDocumentTypeByCode(req: Request, res: Response): Promise<void> {
  const code = getCode(req, res);
  if (!code) return;

  try {
    const documentType = await findDocumentTypeByCode(code, {
      includeInactive: parseIncludeInactive(req.query.includeInactive),
    });
    if (!documentType) {
      res.status(404).json({ message: "Тип документа не найден" });
      return;
    }
    res.json(documentType);
  } catch (error) {
    sendError(res, error, `GET /api/document-types/${code} failed`);
  }
}

export async function postDocumentType(req: Request, res: Response): Promise<void> {
  const body: unknown = req.body;
  if (!isRecord(body)) {
    res.status(400).json({ message: "Тело запроса должно быть JSON-объектом" });
    return;
  }
  const code = readText(body.code, "code", { max: 100 })?.toLowerCase();
  const name = readText(body.name, "name", { max: 200 });
  if (!code || !TYPE_CODE_RE.test(code)) {
    res.status(400).json({ message: "Код: латинские буквы, цифры, дефис и подчёркивание; первый символ — буква" });
    return;
  }
  if (!name) {
    res.status(400).json({ message: "Укажите название типа документа (до 200 символов)" });
    return;
  }
  if (body.description !== undefined && !validNullableText(body.description)) {
    res.status(400).json({ message: "description должен быть строкой или null (до 2000 символов)" });
    return;
  }
  if (body.templateUrl !== undefined && !validNullableText(body.templateUrl, 2048)) {
    res.status(400).json({ message: "templateUrl должен быть строкой или null (до 2048 символов)" });
    return;
  }

  const input: CreateDocumentTypeInput = {
    code,
    name,
    ...(body.description !== undefined ? { description: body.description as string | null } : {}),
    ...(body.templateUrl !== undefined ? { templateUrl: body.templateUrl as string | null } : {}),
  };
  try {
    const created = await createDocumentType(input);
    res.status(201).json(created);
  } catch (error) {
    sendError(res, error, "POST /api/document-types failed");
  }
}

export async function patchDocumentType(req: Request, res: Response): Promise<void> {
  const code = getCode(req, res);
  if (!code) return;
  const body: unknown = req.body;
  if (!isRecord(body)) {
    res.status(400).json({ message: "Тело запроса должно быть JSON-объектом" });
    return;
  }
  const allowed = ["name", "description", "templateUrl", "isActive"];
  if (Object.keys(body).some((key) => !allowed.includes(key))) {
    res.status(400).json({ message: "Разрешены только name, description, templateUrl и isActive. Код типа неизменяемый" });
    return;
  }
  if (Object.keys(body).length === 0) {
    res.status(400).json({ message: "Укажите хотя бы одно поле для обновления" });
    return;
  }

  const input: UpdateDocumentTypeInput = {};
  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    const name = readText(body.name, "name", { max: 200 });
    if (!name) {
      res.status(400).json({ message: "name должен быть непустой строкой до 200 символов" });
      return;
    }
    input.name = name;
  }
  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    if (!validNullableText(body.description)) {
      res.status(400).json({ message: "description должен быть строкой или null (до 2000 символов)" });
      return;
    }
    input.description = body.description as string | null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "templateUrl")) {
    if (!validNullableText(body.templateUrl, 2048)) {
      res.status(400).json({ message: "templateUrl должен быть строкой или null (до 2048 символов)" });
      return;
    }
    input.templateUrl = body.templateUrl as string | null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "isActive")) {
    if (typeof body.isActive !== "boolean") {
      res.status(400).json({ message: "isActive должен быть true или false" });
      return;
    }
    input.isActive = body.isActive;
  }

  try {
    res.json(await updateDocumentType(code, input));
  } catch (error) {
    sendError(res, error, `PATCH /api/document-types/${code} failed`);
  }
}

export async function deleteDocumentType(req: Request, res: Response): Promise<void> {
  const code = getCode(req, res);
  if (!code) return;
  try {
    res.json(await deactivateDocumentType(code));
  } catch (error) {
    sendError(res, error, `DELETE /api/document-types/${code} failed`);
  }
}

function parseFieldCreateBody(body: unknown): CreateDocumentTypeFieldInput | string {
  if (!isRecord(body)) return "Тело запроса должно быть JSON-объектом";
  const name = readText(body.name, "name", { max: 100 })?.toLowerCase();
  const label = readText(body.label, "label", { max: 200 });
  if (!name || !FIELD_KEY_RE.test(name)) {
    return "name поля должен состоять из латинских букв в нижнем регистре, цифр и подчёркиваний и начинаться с буквы";
  }
  if (!label) return "Укажите label поля (до 200 символов)";
  const dataType = normalizeFieldDataType(body.dataType ?? body.type);
  if (!dataType) return "Недопустимый dataType. Допустимы text/string, textarea, number, date, datetime, boolean, select";
  if (body.required !== undefined && typeof body.required !== "boolean") return "required должен быть boolean";
  if (body.sortOrder !== undefined && (!Number.isInteger(body.sortOrder) || (body.sortOrder as number) < 0 || (body.sortOrder as number) > 100000)) {
    return "sortOrder должен быть целым числом от 0 до 100000";
  }
  if (body.options !== undefined && body.options !== null && !Array.isArray(body.options)) {
    return "options должен быть массивом или null";
  }
  if (body.validation !== undefined && body.validation !== null && !isRecord(body.validation)) {
    return "validation должен быть объектом или null";
  }
  return {
    name,
    label,
    dataType,
    ...(body.required !== undefined ? { required: body.required as boolean } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder as number } : {}),
    ...(body.options !== undefined ? { options: body.options as unknown[] | null } : {}),
    ...(body.validation !== undefined ? { validation: body.validation as Record<string, unknown> | null } : {}),
  };
}

export async function postDocumentTypeField(req: Request, res: Response): Promise<void> {
  const code = getCode(req, res);
  if (!code) return;
  const parsed = parseFieldCreateBody(req.body);
  if (typeof parsed === "string") {
    res.status(400).json({ message: parsed });
    return;
  }
  try {
    res.status(201).json(await createDocumentTypeField(code, parsed));
  } catch (error) {
    sendError(res, error, `POST /api/document-types/${code}/fields failed`);
  }
}

export async function patchDocumentTypeField(req: Request, res: Response): Promise<void> {
  const code = getCode(req, res);
  if (!code) return;
  const fieldId = req.params.fieldId;
  if (!fieldId || !UUID_RE.test(fieldId)) {
    res.status(400).json({ message: "Некорректный UUID поля" });
    return;
  }
  if (!isRecord(req.body)) {
    res.status(400).json({ message: "Тело запроса должно быть JSON-объектом" });
    return;
  }
  const body = req.body as Record<string, unknown>;
  const allowed = ["label", "type", "dataType", "required", "sortOrder", "options", "validation", "isActive"];
  if (Object.keys(body).some((key) => !allowed.includes(key))) {
    res.status(400).json({ message: "Недопустимое поле. Ключ name существующего поля неизменяемый, чтобы не потерять старые данные" });
    return;
  }
  if (Object.keys(body).length === 0) {
    res.status(400).json({ message: "Укажите хотя бы одно поле для обновления" });
    return;
  }

  const input: UpdateDocumentTypeFieldInput = {};
  if (Object.prototype.hasOwnProperty.call(body, "label")) {
    const label = readText(body.label, "label", { max: 200 });
    if (!label) {
      res.status(400).json({ message: "label должен быть непустой строкой до 200 символов" });
      return;
    }
    input.label = label;
  }
  if (Object.prototype.hasOwnProperty.call(body, "type") || Object.prototype.hasOwnProperty.call(body, "dataType")) {
    const dataType = normalizeFieldDataType(body.dataType ?? body.type);
    if (!dataType) {
      res.status(400).json({ message: "Недопустимый dataType. Допустимы text/string, textarea, number, date, datetime, boolean, select" });
      return;
    }
    input.dataType = dataType;
  }
  if (Object.prototype.hasOwnProperty.call(body, "required")) {
    if (typeof body.required !== "boolean") {
      res.status(400).json({ message: "required должен быть boolean" });
      return;
    }
    input.required = body.required;
  }
  if (Object.prototype.hasOwnProperty.call(body, "sortOrder")) {
    if (!Number.isInteger(body.sortOrder) || (body.sortOrder as number) < 0 || (body.sortOrder as number) > 100000) {
      res.status(400).json({ message: "sortOrder должен быть целым числом от 0 до 100000" });
      return;
    }
    input.sortOrder = body.sortOrder as number;
  }
  if (Object.prototype.hasOwnProperty.call(body, "options")) {
    if (body.options !== null && !Array.isArray(body.options)) {
      res.status(400).json({ message: "options должен быть массивом или null" });
      return;
    }
    input.options = body.options as unknown[] | null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "validation")) {
    if (body.validation !== null && !isRecord(body.validation)) {
      res.status(400).json({ message: "validation должен быть объектом или null" });
      return;
    }
    input.validation = body.validation as Record<string, unknown> | null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "isActive")) {
    if (typeof body.isActive !== "boolean") {
      res.status(400).json({ message: "isActive должен быть true или false" });
      return;
    }
    input.isActive = body.isActive;
  }

  try {
    res.json(await updateDocumentTypeField(code, fieldId, input));
  } catch (error) {
    sendError(res, error, `PATCH /api/document-types/${code}/fields/${fieldId} failed`);
  }
}

export async function deleteDocumentTypeField(req: Request, res: Response): Promise<void> {
  const code = getCode(req, res);
  if (!code) return;
  const fieldId = req.params.fieldId;
  if (!fieldId || !UUID_RE.test(fieldId)) {
    res.status(400).json({ message: "Некорректный UUID поля" });
    return;
  }
  try {
    res.json(await deactivateDocumentTypeField(code, fieldId));
  } catch (error) {
    sendError(res, error, `DELETE /api/document-types/${code}/fields/${fieldId} failed`);
  }
}
