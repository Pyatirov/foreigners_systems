import type { Request, Response } from "express";
import { Student } from "@/modules/Student/student.model.js";
import { getStudentsSortedByCreatedAt } from "@/services/item.service.js";

export const getStudents = async (req: Request, res: Response) => {
  try {
    // Забираем из запроса параметры пагинации, поиска и фильтры через деструктуризацию
    const { page = 1, limit = 10, search, ...filters } = req.query;

    // Строим запрос к MongoDB
    const query: Record<string, any> = {};

    // Поиск по имени/фамилии
    if (search) {
      // Используем $or для поиска по нескольким полям
      query.$or = [
        // Проверяем вхождение строки поиска хоты бы в firstname, lastname или middlename (регистронезависимо), где
        // $regex - для поиска по шаблону, $options: "i" - для игнорирования регистра
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
        { middlename: { $regex: search, $options: "i" } },
      ];
    }

    // Остальные фильтры (country, sex и т.д.)
    // Создаем из filters массив пар [ключ, значение] и проходим по ним циклом, 
    // добавляя в запрос только те, у которых есть значение (не null и не пустая строка)
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query[key] = value;
    });

    // Парсим из строки числа для пагинации (из query они пришли строкой) и вычисляем skip
    const pageNum  = Number(page);
    const limitNum = Number(limit);
    const skip     = (pageNum - 1) * limitNum;

    // Выполняем запрос к базе: сначала получаем отфильтрованные и отсортированные данные с пагинацией,
    // а параллельно считаем общее количество таких записей для фронта (для отображения общего количества страниц)
    const [items, total] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Student.countDocuments(query),
    ]);

    res.json({ items, total });
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    console.log("CREATE STUDENT BODY:", req.body);

    const { photoUrl, ...data } = req.body;

    // If a file was uploaded, use the file path; otherwise use provided photoUrl
    if (req.file) {
      data.photoUrl = `/uploads/photos/${req.file.filename}`;
    } else if (typeof photoUrl === "string" && photoUrl.trim() !== "") {
      data.photoUrl = photoUrl;
    }

    const newStudent = new Student(data);
    await newStudent.save();

    res.status(201).json(newStudent);
  } catch (error: any) {
    console.error("CREATE STUDENT ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};


// Обновление студента
export const updateStudent = async (req: Request, res: Response) => {
  try {
    console.log("UPDATE BODY:", req.body);

    const {
      _id,
      __v,
      createdAt,
      updatedAt,
      photoUrl,
      ...data
    } = req.body;

    // If a file was uploaded, use the file path
    if (req.file) {
      data.photoUrl = `/uploads/photos/${req.file.filename}`;
    } else if (photoUrl && typeof photoUrl === "string") {
      data.photoUrl = photoUrl;
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(updated);
  } catch (error: any) {
    console.error("UPDATE ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};


// Удаление студента
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Student not found" });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error deleting student", error });
  }
};
