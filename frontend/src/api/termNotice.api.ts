import { createBaseApi } from "./createBaseApi";
import type { TermNotice } from "../models/termNotice";

export const termNoticeApi = createBaseApi<TermNotice>("/termination_notifications");