import { pool } from "@/connectDB.js";

export type DocumentFieldDataType =
  | "string"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "select";

type DbDocumentFieldDataType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "select";

export type DocumentTypeFieldApi = {
  id: string;
  name: string;
  label: string;
  type: DocumentFieldDataType;
  dataType: string;
  required: boolean;
  sortOrder: number;
  options: unknown[] | Record<string, unknown> | null;
  validation: Record<string, unknown> | null;
  isActive: boolean;
};

export type DocumentTypeApi = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  templateUrl: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fields: DocumentTypeFieldApi[];
};

export class DocumentTypeServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "DocumentTypeServiceError";
  }
}

type DocumentTypeQueryRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  templateUrl: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  fields: DocumentTypeFieldApi[] | null;
};

export type CreateDocumentTypeInput = {
  code: string;
  name: string;
  description?: string | null;
  templateUrl?: string | null;
};

export type UpdateDocumentTypeInput = {
  name?: string;
  description?: string | null;
  templateUrl?: string | null;
  isActive?: boolean;
};

export type CreateDocumentTypeFieldInput = {
  name: string;
  label: string;
  dataType: DbDocumentFieldDataType;
  required?: boolean;
  sortOrder?: number;
  options?: unknown[] | null;
  validation?: Record<string, unknown> | null;
};

export type UpdateDocumentTypeFieldInput = {
  label?: string;
  dataType?: DbDocumentFieldDataType;
  required?: boolean;
  sortOrder?: number;
  options?: unknown[] | null;
  validation?: Record<string, unknown> | null;
  isActive?: boolean;
};

function toIsoString(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

function mapDocumentType(row: DocumentTypeQueryRow): DocumentTypeApi {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    templateUrl: row.templateUrl,
    isSystem: row.isSystem,
    isActive: row.isActive,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
    fields: row.fields ?? [],
  };
}

const DOCUMENT_TYPE_SELECT = `
  dt.id,
  dt.code,
  dt.name,
  dt.description,
  dt.template_url AS "templateUrl",
  dt.is_system AS "isSystem",
  dt.is_active AS "isActive",
  dt.created_at AS "createdAt",
  dt.updated_at AS "updatedAt",
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', f.id,
        'name', f.field_key,
        'label', f.label,
        'type', CASE f.data_type
          WHEN 'text' THEN 'string'
          WHEN 'textarea' THEN 'textarea'
          WHEN 'number' THEN 'number'
          WHEN 'date' THEN 'date'
          WHEN 'datetime' THEN 'datetime'
          WHEN 'boolean' THEN 'boolean'
          WHEN 'select' THEN 'select'
          ELSE 'string'
        END,
        'dataType', f.data_type,
        'required', f.is_required,
        'sortOrder', f.sort_order,
        'options', f.options,
        'validation', f.validation,
        'isActive', f.is_active
      )
      ORDER BY f.sort_order, f.field_key
    ) FILTER (WHERE f.id IS NOT NULL),
    '[]'::jsonb
  ) AS fields
`;

/** Returns active document types with active fields by default. */
export async function listDocumentTypes(options?: {
  includeInactive?: boolean;
}): Promise<DocumentTypeApi[]> {
  const includeInactive = options?.includeInactive === true;

  const result = await pool.query<DocumentTypeQueryRow>(
    `
      SELECT ${DOCUMENT_TYPE_SELECT}
      FROM app.document_types AS dt
      LEFT JOIN app.document_type_fields AS f
        ON f.document_type_id = dt.id
       AND ($1::boolean = TRUE OR f.is_active = TRUE)
      WHERE ($1::boolean = TRUE OR dt.is_active = TRUE)
      GROUP BY dt.id
      ORDER BY dt.name ASC, dt.code ASC
    `,
    [includeInactive]
  );

  return result.rows.map(mapDocumentType);
}

/** Returns one document type by its stable code, including its fields. */
export async function findDocumentTypeByCode(
  code: string,
  options?: { includeInactive?: boolean }
): Promise<DocumentTypeApi | null> {
  const includeInactive = options?.includeInactive === true;

  const result = await pool.query<DocumentTypeQueryRow>(
    `
      SELECT ${DOCUMENT_TYPE_SELECT}
      FROM app.document_types AS dt
      LEFT JOIN app.document_type_fields AS f
        ON f.document_type_id = dt.id
       AND ($2::boolean = TRUE OR f.is_active = TRUE)
      WHERE dt.code = $1
        AND ($2::boolean = TRUE OR dt.is_active = TRUE)
      GROUP BY dt.id
      LIMIT 1
    `,
    [code, includeInactive]
  );

  const row = result.rows[0];
  return row ? mapDocumentType(row) : null;
}

export async function createDocumentType(
  input: CreateDocumentTypeInput
): Promise<DocumentTypeApi> {
  await pool.query(
    `
      INSERT INTO app.document_types
        (code, name, description, template_url, is_system, is_active)
      VALUES ($1, $2, $3, $4, FALSE, TRUE)
    `,
    [input.code, input.name, input.description ?? null, input.templateUrl ?? null]
  );

  const created = await findDocumentTypeByCode(input.code, { includeInactive: true });
  if (!created) throw new Error("Тип документа создан, но не найден при повторном чтении");
  return created;
}

export async function updateDocumentType(
  code: string,
  input: UpdateDocumentTypeInput
): Promise<DocumentTypeApi> {
  const existingResult = await pool.query<{
    id: string;
    isSystem: boolean;
    isActive: boolean;
  }>(
    `SELECT id, is_system AS "isSystem", is_active AS "isActive"
     FROM app.document_types WHERE code = $1 LIMIT 1`,
    [code]
  );
  const existing = existingResult.rows[0];
  if (!existing) throw new DocumentTypeServiceError("Тип документа не найден", 404);

  if (input.isActive === false && existing.isSystem) {
    throw new DocumentTypeServiceError(
      "Встроенный тип нельзя отключить. Отключите его поля или скройте его в настройках интерфейса.",
      409
    );
  }

  await pool.query(
    `
      UPDATE app.document_types
      SET
        name = CASE WHEN $2::boolean THEN $3::text ELSE name END,
        description = CASE WHEN $4::boolean THEN $5::text ELSE description END,
        template_url = CASE WHEN $6::boolean THEN $7::text ELSE template_url END,
        is_active = CASE WHEN $8::boolean THEN $9::boolean ELSE is_active END,
        updated_at = NOW()
      WHERE code = $1
    `,
    [
      code,
      Object.prototype.hasOwnProperty.call(input, "name"), input.name ?? null,
      Object.prototype.hasOwnProperty.call(input, "description"), input.description ?? null,
      Object.prototype.hasOwnProperty.call(input, "templateUrl"), input.templateUrl ?? null,
      Object.prototype.hasOwnProperty.call(input, "isActive"), input.isActive ?? null,
    ]
  );

  const updated = await findDocumentTypeByCode(code, { includeInactive: true });
  if (!updated) throw new DocumentTypeServiceError("Тип документа не найден", 404);
  return updated;
}

/** Soft-deactivation preserves the type and its existing document records. */
export async function deactivateDocumentType(code: string): Promise<DocumentTypeApi> {
  const existing = await findDocumentTypeByCode(code, { includeInactive: true });
  if (!existing) throw new DocumentTypeServiceError("Тип документа не найден", 404);
  if (existing.isSystem) {
    throw new DocumentTypeServiceError(
      "Встроенный тип нельзя отключить. Можно отключать пользовательские типы документов.",
      409
    );
  }

  await pool.query(
    `UPDATE app.document_types SET is_active = FALSE, updated_at = NOW() WHERE code = $1`,
    [code]
  );

  const updated = await findDocumentTypeByCode(code, { includeInactive: true });
  if (!updated) throw new DocumentTypeServiceError("Тип документа не найден", 404);
  return updated;
}

async function findTypeIdByCode(code: string): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `SELECT id FROM app.document_types WHERE code = $1 LIMIT 1`,
    [code]
  );
  const row = result.rows[0];
  if (!row) throw new DocumentTypeServiceError("Тип документа не найден", 404);
  return row.id;
}

export async function createDocumentTypeField(
  code: string,
  input: CreateDocumentTypeFieldInput
): Promise<DocumentTypeApi> {
  const documentTypeId = await findTypeIdByCode(code);
  await pool.query(
    `
      INSERT INTO app.document_type_fields
        (document_type_id, field_key, label, data_type, is_required, sort_order, options, validation, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, TRUE)
    `,
    [
      documentTypeId,
      input.name,
      input.label,
      input.dataType,
      input.required ?? false,
      input.sortOrder ?? 0,
      input.options == null ? null : JSON.stringify(input.options),
      input.validation == null ? null : JSON.stringify(input.validation),
    ]
  );

  const updated = await findDocumentTypeByCode(code, { includeInactive: true });
  if (!updated) throw new DocumentTypeServiceError("Тип документа не найден", 404);
  return updated;
}

export async function updateDocumentTypeField(
  code: string,
  fieldId: string,
  input: UpdateDocumentTypeFieldInput
): Promise<DocumentTypeApi> {
  const documentTypeId = await findTypeIdByCode(code);
  const fieldExists = await pool.query(
    `SELECT 1 FROM app.document_type_fields WHERE id = $1::uuid AND document_type_id = $2::uuid LIMIT 1`,
    [fieldId, documentTypeId]
  );
  if (fieldExists.rowCount === 0) {
    throw new DocumentTypeServiceError("Поле документа не найдено", 404);
  }

  const setters: string[] = [];
  const values: unknown[] = [fieldId, documentTypeId];
  const add = (sqlColumn: string, value: unknown, cast = ""): void => {
    values.push(value);
    setters.push(`${sqlColumn} = $${values.length}${cast}`);
  };

  if (Object.prototype.hasOwnProperty.call(input, "label")) add("label", input.label);
  if (Object.prototype.hasOwnProperty.call(input, "dataType")) add("data_type", input.dataType);
  if (Object.prototype.hasOwnProperty.call(input, "required")) add("is_required", input.required);
  if (Object.prototype.hasOwnProperty.call(input, "sortOrder")) add("sort_order", input.sortOrder);
  if (Object.prototype.hasOwnProperty.call(input, "options")) {
    add("options", input.options == null ? null : JSON.stringify(input.options), "::jsonb");
  }
  if (Object.prototype.hasOwnProperty.call(input, "validation")) {
    add("validation", input.validation == null ? null : JSON.stringify(input.validation), "::jsonb");
  }
  if (Object.prototype.hasOwnProperty.call(input, "isActive")) add("is_active", input.isActive);

  if (setters.length === 0) {
    throw new DocumentTypeServiceError("Не указаны поля для обновления", 400);
  }

  await pool.query(
    `UPDATE app.document_type_fields SET ${setters.join(", ")} WHERE id = $1::uuid AND document_type_id = $2::uuid`,
    values
  );

  const updated = await findDocumentTypeByCode(code, { includeInactive: true });
  if (!updated) throw new DocumentTypeServiceError("Тип документа не найден", 404);
  return updated;
}

/** Soft-deactivation of a field avoids deleting historical JSONB values. */
export async function deactivateDocumentTypeField(
  code: string,
  fieldId: string
): Promise<DocumentTypeApi> {
  const documentTypeId = await findTypeIdByCode(code);
  const result = await pool.query(
    `UPDATE app.document_type_fields
     SET is_active = FALSE
     WHERE id = $1::uuid AND document_type_id = $2::uuid`,
    [fieldId, documentTypeId]
  );
  if (result.rowCount === 0) {
    throw new DocumentTypeServiceError("Поле документа не найдено", 404);
  }

  const updated = await findDocumentTypeByCode(code, { includeInactive: true });
  if (!updated) throw new DocumentTypeServiceError("Тип документа не найден", 404);
  return updated;
}

/** Map public UI aliases to the values stored in PostgreSQL. */
export function normalizeFieldDataType(value: unknown): DbDocumentFieldDataType | null {
  if (value === "string") return "text";
  if (
    value === "text" || value === "textarea" || value === "number" ||
    value === "date" || value === "datetime" || value === "boolean" || value === "select"
  ) return value;
  return null;
}