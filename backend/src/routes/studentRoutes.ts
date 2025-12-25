import { Router } from "express"
import { getStudents, createStudent, updateStudent, deleteStudent, getStudentById } from "../controllers/studentController"

export const router = Router();

router.get("/", getStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.get("/:id", getStudentById);

