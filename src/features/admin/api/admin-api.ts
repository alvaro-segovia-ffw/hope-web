import { apiRequest } from "@/lib/api/http-client";

import {
  apartmentsCountResponseSchema,
  lastRunResponseSchema,
  runSyncResponseSchema,
  type LastRunResponse,
} from "./schemas";

export async function getApartmentsCount(token: string): Promise<number> {
  const response = await apiRequest<unknown>("/internal/db/apartments/count", { token });
  const parsed = apartmentsCountResponseSchema.parse(response);

  return typeof parsed === "number" ? parsed : parsed.count;
}

export async function getLastSyncRun(token: string): Promise<LastRunResponse> {
  const response = await apiRequest<unknown>("/internal/sync/onoffice/last-run", { token });
  return lastRunResponseSchema.parse(response);
}

export async function runSync(token: string): Promise<string> {
  const response = await apiRequest<unknown>("/internal/sync/onoffice/run", {
    method: "POST",
    token,
  });

  const parsed = runSyncResponseSchema.parse(response);
  return parsed.message ?? parsed.status ?? "Sync executed.";
}

export async function getWhoAmI(token: string): Promise<unknown> {
  return apiRequest<unknown>("/internal/auth/whoami", { token });
}
