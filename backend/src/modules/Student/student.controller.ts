import type { Request, Response } from "express";
import {
  createStudent as createStudentRecord,
  deleteStudent as deleteStudentRecord,
  findStudentById,
  listStudents,
  StudentConflictError,
  StudentValidationError,
  updateStudent as updateStudentRecord,
} from "@/modules/Student/student.service.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function queryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isValidId(id: string): boolean {
  return UUID_REGEX.test(id);
}

function handleError(res: Response, error: unknown, context: string): void {
  if (error instanceof StudentValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }

  if (error instanceof StudentConflictError) {
    res.status(409).json({ message: error.message });
    return;
  }

  const dbError = error as { code?: string; message?: string };
  if (["22P02", "22007", "22008", "23502", "23514"].includes(dbError?.code ?? "")) {
    res.status(400).json({ message: "Некорректные данные студента" });
    return;
  }

  console.error(`${context}:`, error);
  res.status(500).json({ message: "Внутренняя ошибка сервера" });
}

export async function getStudents(req: Request, res: Response): Promise<void> {
  try {
    const page = Number(queryString(req.query.page) ?? 1);
    const limit = Number(queryString(req.query.limit) ?? 10);
    const search = queryString(req.query.search);

    const filters: Record<string, unknown> = { ...req.query };
    delete filters.page;
    delete filters.limit;
    delete filters.search;

    const result = await listStudents({ page, limit, search, filters });
    res.json(result);
  } catch (error) {
    handleError(res, error, "GET /api/students failed");
  }
}

export async function getStudentById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ message: "Некорректный идентификатор студента" });
    return;
  }

  try {
    const student = await findStudentById(id);
    if (!student) {
      res.status(404).json({ message: "Студент не найден" });
      return;
    }

    res.json(student);
  } catch (error) {
    handleError(res, error, "GET /api/students/:id failed");
  }
}

export async function createStudent(req: Request, res: Response): Promise<void> {
  try {
    const body = { ...req.body } as Record<string, unknown>;

    // Сохранение уже загруженного фото поддерживается, если маршрут
    // подключён к существующему Multer middleware.
    const uploadedFile = (req as Request & { file?: { filename: string } }).file;
    if (uploadedFile?.filename) {
      body.photoUrl = `/uploads/photos/${uploadedFile.filename}`;
    }

    const student = await createStudentRecord(body);
    res.status(201).json(student);
  } catch (error) {
    handleError(res, error, "POST /api/students failed");
  }
}

export async function updateStudent(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ message: "Некорректный идентификатор студента" });
    return;
  }

  try {
    const body = { ...req.body } as Record<string, unknown>;
    delete body.id;
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.__v;

    const uploadedFile = (req as Request & { file?: { filename: string } }).file;
    if (uploadedFile?.filename) {
      body.photoUrl = `/uploads/photos/${uploadedFile.filename}`;
    }

    const student = await updateStudentRecord(id, body);
    if (!student) {
      res.status(404).json({ message: "Студент не найден" });
      return;
    }

    res.json(student);
  } catch (error) {
    handleError(res, error, "PATCH /api/students/:id failed");
  }
}

export async function deleteStudent(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ message: "Некорректный идентификатор студента" });
    return;
  }

  try {
    const deleted = await deleteStudentRecord(id);
    if (!deleted) {
      res.status(404).json({ message: "Студент не найден" });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    handleError(res, error, "DELETE /api/students/:id failed");
  }
}
