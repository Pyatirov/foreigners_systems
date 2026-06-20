import { Router } from "express"
import { getStudents, createStudent, updateStudent, deleteStudent, getStudentById } from "@/modules/Student/student.controller.js"

export const router = Router();

router.get("/", getStudents);
router.post("/", createStudent);
router.patch("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.get("/:id", getStudentById);

