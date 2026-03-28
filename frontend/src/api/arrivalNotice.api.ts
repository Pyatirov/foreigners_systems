import { createBaseApi } from "./createBaseApi";
import type { ArrivalNotice } from "../models/arrivalNotice";

export const arrivalNoticeApi = createBaseApi<ArrivalNotice>("/arrival_notifications");