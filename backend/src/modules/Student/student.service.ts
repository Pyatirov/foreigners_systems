import { pool } from "@/connectDB.js";

export type StudentApiRecord = {
  id: string;
  photoUrl: string | null;
  lastname: string;
  firstname: string;
  middlename: string | null;
  birthdate: string;
  country: string;
  countryCode: string;
  sex: "М" | "Ж";
  createdAt: string;
  updatedAt: string;
};

export type StudentInput = Record<string, unknown>;
export type StudentFilters = Record<string, unknown>;

export class StudentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentValidationError";
  }
}

export class StudentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentConflictError";
  }
}

const COUNTRY_LABELS: Record<string, string> = {
  RU: "Россия",
  US: "США",
  CA: "Канада",
  UZ: "Узбекистан",
  KZ: "Казахстан",
  CN: "Китай",
  IN: "Индия",
  EG: "Египет",
};

const COUNTRY_CODES_BY_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_LABELS).map(([code, label]) => [label.toLocaleLowerCase("ru-RU"), code])
);

const SELECT_COLUMNS = `
  id,
  photo_url AS "photoUrl",
  lastname,
  firstname,
  middlename,
  birthdate,
  country_code AS "countryCode",
  sex,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

type DbStudent = {
  id: string;
  photoUrl: string | null;
  lastname: string;
  firstname: string;
  middlename: string | null;
  birthdate: string;
  countryCode: string;
  sex: "M" | "F";
  createdAt: string;
  updatedAt: string;
};

function toApiStudent(row: DbStudent): StudentApiRecord {
  return {
    ...row,
    country: COUNTRY_LABELS[row.countryCode] ?? row.countryCode,
    sex: row.sex === "M" ? "М" : "Ж",
  };
}

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  return String(value).trim();
}

function normalizeCountryCode(value: unknown): string {
  const country = asTrimmedString(value);
  if (!country) throw new StudentValidationError("Укажите страну гражданства");

  const upper = country.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) return upper;

  const mapped = COUNTRY_CODES_BY_LABEL[country.toLocaleLowerCase("ru-RU")];
  if (mapped) return mapped;

  throw new StudentValidationError(
    "Страна должна быть задана двухбуквенным кодом ISO или названием из списка"
  );
}

function normalizeSex(value: unknown): "M" | "F" {
  if (value === true || value === "true") return "M";
  if (value === false || value === "false") return "F";

  const sex = asTrimmedString(value)?.toLocaleLowerCase("ru-RU");
  if (["m", "м", "мужской", "male"].includes(sex ?? "")) return "M";
  if (["f", "ж", "женский", "female"].includes(sex ?? "")) return "F";

  throw new StudentValidationError("Пол должен быть M или F");
}

function normalizeBirthdate(value: unknown): string {
  const birthdate = asTrimmedString(value);
  if (!birthdate) throw new StudentValidationError("Укажите дату рождения");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
    throw new StudentValidationError("Дата рождения должна быть в формате YYYY-MM-DD");
  }
  return birthdate;
}

const INPUT_TO_COLUMN: Record<string, string> = {
  photoUrl: "photo_url",
  photo_url: "photo_url",
  lastname: "lastname",
  firstname: "firstname",
  middlename: "middlename",
  birthdate: "birthdate",
  country: "country_code",
  countryCode: "country_code",
  country_code: "country_code",
  sex: "sex",
};

function normalizeInput(input: StudentInput): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const [key, rawValue] of Object.entries(input)) {
    const column = INPUT_TO_COLUMN[key];
    if (!column || rawValue === undefined) continue;

    if (column === "photo_url" || column === "middlename") {
      const value = asTrimmedString(rawValue);
      normalized[column] = value || null;
    } else if (column === "country_code") {
      normalized[column] = normalizeCountryCode(rawValue);
    } else if (column === "sex") {
      normalized[column] = normalizeSex(rawValue);
    } else if (column === "birthdate") {
      normalized[column] = normalizeBirthdate(rawValue);
    } else {
      const value = asTrimmedString(rawValue);
      if (!value) {
        throw new StudentValidationError(
          key === "lastname" ? "Укажите фамилию" : "Укажите имя"
        );
      }
      normalized[column] = value;
    }
  }

  return normalized;
}

function validateCreateInput(data: Record<string, unknown>): void {
  const requiredFields = ["lastname", "firstname", "birthdate", "country_code", "sex"];
  const missing = requiredFields.filter((field) => data[field] === undefined || data[field] === null);
  if (missing.length > 0) {
    const labels: Record<string, string> = {
      lastname: "фамилию",
      firstname: "имя",
      birthdate: "дату рождения",
      country_code: "страну гражданства",
      sex: "пол",
    };
    throw new StudentValidationError(`Необходимо указать ${missing.map((field) => labels[field] ?? field).join(", ") }`);
  }
}

function stringParam(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export async function listStudents(options: {
  page?: number;
  limit?: number;
  search?: string;
  filters?: StudentFilters;
}): Promise<{ items: StudentApiRecord[]; total: number }> {
  const page = Number.isFinite(options.page) && (options.page ?? 0) > 0
    ? Math.floor(options.page!)
    : 1;
  const limit = Number.isFinite(options.limit) && (options.limit ?? 0) > 0
    ? Math.min(100, Math.floor(options.limit!))
    : 10;
  const offset = (page - 1) * limit;

  const where: string[] = [];
  const values: unknown[] = [];
  const addValue = (value: unknown): string => {
    values.push(value);
    return `$${values.length}`;
  };

  const search = stringParam(options.search);
  if (search) {
    const placeholder = addValue(`%${search}%`);
    where.push(`(
      lastname ILIKE ${placeholder}
      OR firstname ILIKE ${placeholder}
      OR COALESCE(middlename, '') ILIKE ${placeholder}
    )`);
  }

  const filterDefinitions: Record<string, { column: string; kind: "text" | "country" | "sex" | "date" }> = {
    lastname: { column: "lastname", kind: "text" },
    firstname: { column: "firstname", kind: "text" },
    middlename: { column: "middlename", kind: "text" },
    country: { column: "country_code", kind: "country" },
    countryCode: { column: "country_code", kind: "country" },
    country_code: { column: "country_code", kind: "country" },
    sex: { column: "sex", kind: "sex" },
    birthdate: { column: "birthdate", kind: "date" },
  };

  for (const [key, rawValue] of Object.entries(options.filters ?? {})) {
    const definition = filterDefinitions[key];
    const value = stringParam(rawValue);
    if (!definition || !value) continue;

    let normalizedValue: unknown = value;
    if (definition.kind === "country") normalizedValue = normalizeCountryCode(value);
    if (definition.kind === "sex") normalizedValue = normalizeSex(value);

    const placeholder = addValue(
      definition.kind === "text" ? `%${String(normalizedValue)}%` : normalizedValue
    );
    where.push(
      definition.kind === "text"
        ? `${definition.column} ILIKE ${placeholder}`
        : `${definition.column} = ${placeholder}`
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM app.students ${whereSql}`,
    values
  );

  const dataValues = [...values, limit, offset];
  const limitPlaceholder = `$${values.length + 1}`;
  const offsetPlaceholder = `$${values.length + 2}`;

  const result = await pool.query<DbStudent>(
    `
      SELECT ${SELECT_COLUMNS}
      FROM app.students
      ${whereSql}
      ORDER BY created_at DESC, id
      LIMIT ${limitPlaceholder}
      OFFSET ${offsetPlaceholder}
    `,
    dataValues
  );

  return {
    items: result.rows.map(toApiStudent),
    total: Number(countResult.rows[0]?.total ?? 0),
  };
}

export async function findStudentById(id: string): Promise<StudentApiRecord | null> {
  const result = await pool.query<DbStudent>(
    `SELECT ${SELECT_COLUMNS} FROM app.students WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] ? toApiStudent(result.rows[0]) : null;
}

export async function createStudent(input: StudentInput): Promise<StudentApiRecord> {
  const data = normalizeInput(input);
  validateCreateInput(data);

  const result = await pool.query<DbStudent>(
    `
      INSERT INTO app.students (
        photo_url,
        lastname,
        firstname,
        middlename,
        birthdate,
        country_code,
        sex
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ${SELECT_COLUMNS}
    `,
    [
      data.photo_url ?? null,
      data.lastname,
      data.firstname,
      data.middlename ?? null,
      data.birthdate,
      data.country_code,
      data.sex,
    ]
  );

  return toApiStudent(result.rows[0]);
}

export async function updateStudent(
  id: string,
  input: StudentInput
): Promise<StudentApiRecord | null> {
  const data = normalizeInput(input);
  const entries = Object.entries(data);

  if (entries.length === 0) {
    throw new StudentValidationError("Нет полей для обновления");
  }

  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([column], index) => `${column} = $${index + 1}`);
  values.push(id);

  const result = await pool.query<DbStudent>(
    `
      UPDATE app.students
      SET ${assignments.join(", ")}
      WHERE id = $${values.length}
      RETURNING ${SELECT_COLUMNS}
    `,
    values
  );

  return result.rows[0] ? toApiStudent(result.rows[0]) : null;
}

export async function deleteStudent(id: string): Promise<boolean> {
  // Не удаляем студента, если к нему привязаны документы.
  // Это предотвращает случайное удаление связанных записей каскадом.
  const result = await pool.query<{ id: string }>(
    `
      DELETE FROM app.students AS s
      WHERE s.id = $1
        AND NOT EXISTS (
          SELECT 1
          FROM app.documents AS d
          WHERE d.student_id = s.id
        )
      RETURNING s.id
    `,
    [id]
  );

  if (result.rowCount && result.rowCount > 0) return true;

  const exists = await pool.query(
    `SELECT 1 FROM app.students WHERE id = $1 LIMIT 1`,
    [id]
  );

  if (exists.rowCount === 0) return false;

  throw new StudentConflictError(
    "Нельзя удалить студента, пока к нему привязаны документы"
  );
}
