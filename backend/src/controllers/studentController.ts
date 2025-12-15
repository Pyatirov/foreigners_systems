import { Request, Response } from "express";
import { Student } from "../models/Student";

// Получение всех студентов
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};

// Создание студента
export const createStudent = async (req: Request, res: Response) => {
  try {
    console.log("CREATE STUDENT BODY:", req.body);
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    console.log("CREATE STUDENT ERROR:", error);
    res.status(500).json({ message: "Error creating student", error });
  }
};

// Обновление студента
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Student not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating student", error });
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
