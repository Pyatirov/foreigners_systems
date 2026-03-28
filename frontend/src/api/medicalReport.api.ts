import { createBaseApi } from "./createBaseApi";
import type { MedicalReport } from "../models/medicalReport";

export const medicalReportApi = createBaseApi<MedicalReport>("/medical_reports");