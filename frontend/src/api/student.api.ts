import { createBaseApi } from "./createBaseApi";
import type { Student } from "../models/student";

export const studentApi = createBaseApi<Student>("/students");