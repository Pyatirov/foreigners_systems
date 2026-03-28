import { createBaseApi } from "./createBaseApi";
import type { Visa } from "../models/visa";

export const visaApi = createBaseApi<Visa>("/visas");