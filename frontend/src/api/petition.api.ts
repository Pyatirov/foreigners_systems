import { createBaseApi } from "./createBaseApi";
import type { Petition } from "../models/petition";

export const petitionApi = createBaseApi<Petition>("/petitions");