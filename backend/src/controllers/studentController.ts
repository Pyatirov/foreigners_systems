import { Request, Response } from "express";
import { Student } from "../models/Student";
import { getStudentsSortedByCreatedAt } from "@/services/item.service";

// Получение всех студентов
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await getStudentsSortedByCreatedAt();
    res.json(students);
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

    if (typeof photoUrl === "string" && photoUrl.trim() !== "") {
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

    // защита от неверного типа
    if (photoUrl && typeof photoUrl === "string") {
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
