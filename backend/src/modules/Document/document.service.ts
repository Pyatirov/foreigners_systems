import type { PoolClient } from "pg";
import { pool } from "@/connectDB.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_STATUSES = ["active", "archived", "revoked"] as const;
type DocumentStatus = (typeof ALLOWED_STATUSES)[number];
type JsonObject = Record<string, unknown>;

type DbDocumentType = {
  id: string;
  code: string;
  name: string;
};

type DbDocumentField = {
  fieldKey: string;
  label: string;
  dataType: string;
  isRequired: boolean;
  options: unknown;
  validation: unknown;
};

type DbDocument = {
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
  data: JsonObject;
  createdAt: string;
  updatedAt: string;
};

export type DocumentApiRecord = DbDocument;
export type DocumentInput = Record<string, unknown>;

export class DocumentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentValidationError";
  }
}

export class DocumentNotFoundError extends Error {
  constructor(message = "Документ не найден") {
    super(message);
    this.name = "DocumentNotFoundError";
  }
}

export class DocumentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentConflictError";
  }
}

const DOCUMENT_SELECT = `
  SELECT
    d.id,
    d.student_id AS "studentId",
    concat_ws(' ', s.lastname, s.firstname, s.middlename) AS "studentName",
    d.document_type_id AS "documentTypeId",
    dt.code AS "typeCode",
    dt.name AS "typeName",
    d.series,
    d.number,
    d.issued_date AS "issuedDate",
    d.expiry_date AS "expiryDate",
    d.scan_url AS "scanUrl",
    d.notes,
    d.uploaded_at AS "uploadedAt",
    d.status,
    d.data,
    d.created_at AS "createdAt",
    d.updated_at AS "updatedAt"
  FROM app.documents AS d
  JOIN app.document_types AS dt ON dt.id = d.document_type_id
  JOIN app.students AS s ON s.id = d.student_id
`;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function stringValue(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  return String(value).trim();
}

function optionalText(value: unknown, label: string): string | null {
  if (value === null) return null;
  if (value === undefined) return null;
  if (typeof value !== "string" && typeof value !== "number") {
    throw new DocumentValidationError(`${label}: ожидается строка`);
  }
  const result = String(value).trim();
  return result.length ? result : null;
}

function requiredUuid(value: unknown, label: string): string {
  const result = stringValue(value);
  if (!result || !UUID_REGEX.test(result)) {
    throw new DocumentValidationError(`${label}: некорректный UUID`);
  }
  return result;
}

function normalizeDate(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new DocumentValidationError(`${label}: дата должна быть в формате YYYY-MM-DD`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new DocumentValidationError(`${label}: указана несуществующая дата`);
  }
  return value;
}

async function resolveDocumentType(
  client: PoolClient,
  selector: unknown
): Promise<DbDocumentType> {
  const value = stringValue(selector);
  if (!value) {
    throw new DocumentValidationError("Укажите typeCode или documentTypeId");
  }

  const result = UUID_REGEX.test(value)
    ? await client.query<DbDocumentType>(
        `SELECT id, code, name FROM app.document_types WHERE id = $1 AND is_active = TRUE LIMIT 1`,
        [value]
      )
    : await client.query<DbDocumentType>(
        `SELECT id, code, name FROM app.document_types WHERE code = $1 AND is_active = TRUE LIMIT 1`,
        [value]
      );

  const type = result.rows[0];
  if (!type) {
    throw new DocumentValidationError("Тип документа не найден или отключён");
  }
  return type;
}

async function getFields(client: PoolClient, documentTypeId: string): Promise<DbDocumentField[]> {
  const result = await client.query<DbDocumentField>(
    `
      SELECT
        field_key AS "fieldKey",
        label,
        data_type AS "dataType",
        is_required AS "isRequired",
        options,
        validation
      FROM app.document_type_fields
      WHERE document_type_id = $1 AND is_active = TRUE
      ORDER BY sort_order, field_key
    `,
    [documentTypeId]
  );
  return result.rows;
}

function validateSelectOption(field: DbDocumentField, value: string): void {
  if (!Array.isArray(field.options) || field.options.length === 0) return;
  const allowed = field.options.map((option) => {
    if (typeof option === "string" || typeof option === "number") return String(option);
    if (isObject(option) && (typeof option.value === "string" || typeof option.value === "number")) {
      return String(option.value);
    }
    return undefined;
  }).filter((item): item is string => item !== undefined);

  if (allowed.length && !allowed.includes(value)) {
    throw new DocumentValidationError(`Поле «${field.label}»: выберите значение из списка`);
  }
}

function normalizeDynamicValue(field: DbDocumentField, rawValue: unknown): unknown {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    if (field.isRequired) {
      throw new DocumentValidationError(`Заполните обязательное поле «${field.label}»`);
    }
    return null;
  }

  switch (field.dataType) {
    case "number": {
      const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
      if (!Number.isFinite(value)) {
        throw new DocumentValidationError(`Поле «${field.label}» должно быть числом`);
      }
      return value;
    }
    case "date": {
      if (typeof rawValue !== "string" || !normalizeDate(rawValue, field.label)) {
        throw new DocumentValidationError(`Поле «${field.label}» должно содержать дату YYYY-MM-DD`);
      }
      return rawValue;
    }
    case "datetime": {
      if (typeof rawValue !== "string" || Number.isNaN(Date.parse(rawValue))) {
        throw new DocumentValidationError(`Поле «${field.label}» должно содержать дату и время`);
      }
      return rawValue;
    }
    case "boolean": {
      if (rawValue === true || rawValue === "true") return true;
      if (rawValue === false || rawValue === "false") return false;
      throw new DocumentValidationError(`Поле «${field.label}» должно иметь логическое значение`);
    }
    case "select": {
      const value = stringValue(rawValue);
      if (!value) throw new DocumentValidationError(`Заполните поле «${field.label}»`);
      validateSelectOption(field, value);
      return value;
    }
    case "textarea":
    case "text":
    default: {
      if (typeof rawValue !== "string" && typeof rawValue !== "number") {
        throw new DocumentValidationError(`Поле «${field.label}» должно быть текстовым`);
      }
      const value = String(rawValue).trim();
      if (!value && field.isRequired) {
        throw new DocumentValidationError(`Заполните обязательное поле «${field.label}»`);
      }
      return value || null;
    }
  }
}

function normalizeDynamicData(
  input: DocumentInput,
  fields: DbDocumentField[],
  currentData: JsonObject = {}
): JsonObject {
  const suppliedData = input.data;
  if (suppliedData !== undefined && !isObject(suppliedData)) {
    throw new DocumentValidationError("Поле data должно быть объектом JSON");
  }

  const bodyData = isObject(suppliedData) ? suppliedData : {};
  const allowedKeys = new Set(fields.map((field) => field.fieldKey));

  for (const key of Object.keys(bodyData)) {
    if (!allowedKeys.has(key)) {
      throw new DocumentValidationError(`Поле «${key}» не входит в конфигурацию этого типа документа`);
    }
  }

  const result: JsonObject = { ...currentData };

  for (const field of fields) {
    let value: unknown;
    let wasSupplied = false;

    if (hasOwn(bodyData, field.fieldKey)) {
      value = bodyData[field.fieldKey];
      wasSupplied = true;
    } else if (hasOwn(input, field.fieldKey)) {
      // Поддерживаем и плоский body от форм, если поле динамического типа передано в корне.
      value = input[field.fieldKey];
      wasSupplied = true;
    }

    if (!wasSupplied && hasOwn(currentData, field.fieldKey)) {
      value = currentData[field.fieldKey];
      wasSupplied = true;
    }

    if (!wasSupplied) {
      if (field.isRequired) {
        throw new DocumentValidationError(`Заполните обязательное поле «${field.label}»`);
      }
      continue;
    }

    result[field.fieldKey] = normalizeDynamicValue(field, value);
  }

  return result;
}

const COMMON_INPUTS: Record<string, string> = {
  studentId: "student_id",
  student_id: "student_id",
  series: "series",
  number: "number",
  issuedDate: "issued_date",
  issued_date: "issued_date",
  expiryDate: "expiry_date",
  expiry_date: "expiry_date",
  scanUrl: "scan_url",
  scan_url: "scan_url",
  notes: "notes",
};

function normalizeCommonValue(column: string, value: unknown): unknown {
  switch (column) {
    case "student_id":
      return requiredUuid(value, "studentId");
    case "issued_date":
      return normalizeDate(value, "Дата выдачи");
    case "expiry_date":
      return normalizeDate(value, "Дата окончания действия");
    case "series":
      return optionalText(value, "Серия");
    case "number":
      return optionalText(value, "Номер");
    case "scan_url":
      return optionalText(value, "Ссылка на скан");
    case "notes":
      return optionalText(value, "Примечание");
    default:
      return value;
  }
}

function extractCommonInput(input: DocumentInput): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    const column = COMMON_INPUTS[key];
    if (column && value !== undefined) {
      result[column] = normalizeCommonValue(column, value);
    }
  }
  return result;
}

function validateDateOrder(data: Record<string, unknown>): void {
  const issued = data.issued_date;
  const expiry = data.expiry_date;
  if (typeof issued === "string" && typeof expiry === "string" && expiry < issued) {
    throw new DocumentValidationError("Дата окончания действия не может быть раньше даты выдачи");
  }
}

async function ensureStudentExists(client: PoolClient, studentId: string): Promise<void> {
  const result = await client.query(`SELECT 1 FROM app.students WHERE id = $1 LIMIT 1`, [studentId]);
  if (result.rowCount === 0) {
    throw new DocumentValidationError("Студент с указанным идентификатором не найден");
  }
}

function normalizePagination(pageValue?: number, limitValue?: number) {
  const page = Number.isFinite(pageValue) && (pageValue ?? 0) > 0
    ? Math.floor(pageValue!)
    : 1;
  const limit = Number.isFinite(limitValue) && (limitValue ?? 0) > 0
    ? Math.min(100, Math.floor(limitValue!))
    : 10;
  return { page, limit, offset: (page - 1) * limit };
}

export async function listDocuments(options: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  studentId?: string;
  status?: string;
}): Promise<{ items: DocumentApiRecord[]; total: number }> {
  const { limit, offset } = normalizePagination(options.page, options.limit);
  const where: string[] = [];
  const values: unknown[] = [];
  const addValue = (value: unknown): string => {
    values.push(value);
    return `$${values.length}`;
  };

  const type = stringValue(options.type);
  if (type) {
    where.push(`dt.code = ${addValue(type)}`);
  }

  const studentId = stringValue(options.studentId);
  if (studentId) {
    if (!UUID_REGEX.test(studentId)) throw new DocumentValidationError("Некорректный studentId");
    where.push(`d.student_id = ${addValue(studentId)}`);
  }

  const status = stringValue(options.status) ?? "active";
  if (status !== "all") {
    if (!ALLOWED_STATUSES.includes(status as DocumentStatus)) {
      throw new DocumentValidationError("Недопустимый статус документа");
    }
    where.push(`d.status = ${addValue(status)}`);
  }

  const search = stringValue(options.search);
  if (search) {
    const pattern = addValue(`%${search}%`);
    where.push(`(
      COALESCE(d.series, '') ILIKE ${pattern}
      OR COALESCE(d.number, '') ILIKE ${pattern}
      OR COALESCE(d.notes, '') ILIKE ${pattern}
      OR COALESCE(d.data::text, '') ILIKE ${pattern}
      OR s.lastname ILIKE ${pattern}
      OR s.firstname ILIKE ${pattern}
      OR COALESCE(s.middlename, '') ILIKE ${pattern}
    )`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await pool.query<{ total: string }>(
    `
      SELECT COUNT(*)::text AS total
      FROM app.documents AS d
      JOIN app.document_types AS dt ON dt.id = d.document_type_id
      JOIN app.students AS s ON s.id = d.student_id
      ${whereSql}
    `,
    values
  );

  const dataValues = [...values, limit, offset];
  const limitPlaceholder = `$${values.length + 1}`;
  const offsetPlaceholder = `$${values.length + 2}`;

  const result = await pool.query<DocumentApiRecord>(
    `
      ${DOCUMENT_SELECT}
      ${whereSql}
      ORDER BY d.created_at DESC, d.id
      LIMIT ${limitPlaceholder}
      OFFSET ${offsetPlaceholder}
    `,
    dataValues
  );

  return {
    items: result.rows,
    total: Number(countResult.rows[0]?.total ?? 0),
  };
}

export async function findDocumentById(id: string): Promise<DocumentApiRecord | null> {
  const result = await pool.query<DocumentApiRecord>(
    `${DOCUMENT_SELECT} WHERE d.id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createDocument(input: DocumentInput): Promise<DocumentApiRecord> {
  if (!isObject(input)) throw new DocumentValidationError("Тело запроса должно быть JSON-объектом");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const typeSelector = input.typeCode ?? input.documentTypeCode ?? input.documentTypeId ?? input.document_type_id;
    const documentType = await resolveDocumentType(client, typeSelector);
    const fields = await getFields(client, documentType.id);
    const common = extractCommonInput(input);

    if (!common.student_id) throw new DocumentValidationError("Укажите studentId");
    await ensureStudentExists(client, String(common.student_id));

    const data = normalizeDynamicData(input, fields);
    validateDateOrder(common);

    const inserted = await client.query<{ id: string }>(
      `
        INSERT INTO app.documents (
          student_id,
          document_type_id,
          series,
          number,
          issued_date,
          expiry_date,
          scan_url,
          notes,
          data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        RETURNING id
      `,
      [
        common.student_id,
        documentType.id,
        common.series ?? null,
        common.number ?? null,
        common.issued_date ?? null,
        common.expiry_date ?? null,
        common.scan_url ?? null,
        common.notes ?? null,
        JSON.stringify(data),
      ]
    );

    const result = await client.query<DocumentApiRecord>(
      `${DOCUMENT_SELECT} WHERE d.id = $1 LIMIT 1`,
      [inserted.rows[0].id]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateDocument(
  id: string,
  input: DocumentInput
): Promise<DocumentApiRecord | null> {
  if (!isObject(input)) throw new DocumentValidationError("Тело запроса должно быть JSON-объектом");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existingResult = await client.query<{
      id: string;
      studentId: string;
      documentTypeId: string;
      series: string | null;
      number: string | null;
      issuedDate: string | null;
      expiryDate: string | null;
      scanUrl: string | null;
      notes: string | null;
      status: DocumentStatus;
      data: JsonObject;
    }>(
      `
        SELECT
          id,
          student_id AS "studentId",
          document_type_id AS "documentTypeId",
          series,
          number,
          issued_date AS "issuedDate",
          expiry_date AS "expiryDate",
          scan_url AS "scanUrl",
          notes,
          status,
          data
        FROM app.documents
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    );

    const existing = existingResult.rows[0];
    if (!existing) {
      await client.query("ROLLBACK");
      return null;
    }
    if (existing.status === "archived") {
      throw new DocumentConflictError("Архивный документ нельзя редактировать");
    }

    const fields = await getFields(client, existing.documentTypeId);
    const commonPatch = extractCommonInput(input);

    // Не позволяем менять тип существующей записи через update endpoint.
    const requestedType = input.typeCode ?? input.documentTypeCode ?? input.documentTypeId ?? input.document_type_id;
    if (requestedType !== undefined) {
      const newType = await resolveDocumentType(client, requestedType);
      if (newType.id !== existing.documentTypeId) {
        throw new DocumentValidationError("Нельзя изменить тип существующего документа");
      }
    }

    const data = normalizeDynamicData(input, fields, existing.data ?? {});
    const merged: Record<string, unknown> = {
      student_id: existing.studentId,
      series: existing.series,
      number: existing.number,
      issued_date: existing.issuedDate,
      expiry_date: existing.expiryDate,
      scan_url: existing.scanUrl,
      notes: existing.notes,
      ...commonPatch,
    };

    if (merged.student_id !== existing.studentId) {
      await ensureStudentExists(client, String(merged.student_id));
    }
    validateDateOrder(merged);

    const updated = await client.query(
      `
        UPDATE app.documents
        SET
          student_id = $1,
          series = $2,
          number = $3,
          issued_date = $4,
          expiry_date = $5,
          scan_url = $6,
          notes = $7,
          data = $8::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING id
      `,
      [
        merged.student_id,
        merged.series ?? null,
        merged.number ?? null,
        merged.issued_date ?? null,
        merged.expiry_date ?? null,
        merged.scan_url ?? null,
        merged.notes ?? null,
        JSON.stringify(data),
        id,
      ]
    );

    if (updated.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const result = await client.query<DocumentApiRecord>(
      `${DOCUMENT_SELECT} WHERE d.id = $1 LIMIT 1`,
      [id]
    );

    await client.query("COMMIT");
    return result.rows[0] ?? null;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function archiveDocument(id: string): Promise<DocumentApiRecord | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateResult = await client.query<{ id: string }>(
      `
        UPDATE app.documents
        SET status = 'archived', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status <> 'archived'
        RETURNING id
      `,
      [id]
    );

    if (updateResult.rowCount === 0) {
      const existing = await client.query<{ status: string }>(
        `SELECT status FROM app.documents WHERE id = $1 LIMIT 1`,
        [id]
      );
      await client.query("ROLLBACK");
      if (existing.rowCount === 0) return null;
      throw new DocumentConflictError("Документ уже находится в архиве");
    }

    const result = await client.query<DocumentApiRecord>(
      `${DOCUMENT_SELECT} WHERE d.id = $1 LIMIT 1`,
      [id]
    );

    await client.query("COMMIT");
    return result.rows[0] ?? null;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
