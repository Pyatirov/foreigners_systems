import type { EduAgreement } from "../models/eduAgreement";
import { createBaseApi } from "./createBaseApi";

export const eduAgreementApi = createBaseApi<EduAgreement>("/education_agreements");