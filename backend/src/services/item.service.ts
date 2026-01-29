import { Student } from "../models/Student";

export async function getStudentsSortedByCreatedAt() {
  return Student
    .find({})
    .sort({ createdAt: -1 });
}
