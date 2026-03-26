import { Student } from "@/modules/Student/student.model";

export async function getStudentsSortedByCreatedAt() {
  return Student
    .find({})
    .sort({ createdAt: -1 });
}
