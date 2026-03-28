import { createBaseApi } from "./createBaseApi";
import type { MigrationCard } from "../models/migrationCard";

export const migrationCardApi = createBaseApi<MigrationCard>("/migration_cards");