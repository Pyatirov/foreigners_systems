import { createBaseApi } from "./createBaseApi";
import type { Passport } from "../models/passport";

export const passportApi = createBaseApi<Passport>("/passports");