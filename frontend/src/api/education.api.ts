import { createBaseApi } from "./createBaseApi";
import type { Education } from "../models/education";

export const educationApi = createBaseApi<Education>("/education_documents");