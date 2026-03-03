import { z } from "zod";

export const apartmentsCountResponseSchema = z.union([
  z.number(),
  z
    .object({
      count: z.number(),
    })
    .passthrough(),
]);

export const lastRunResponseSchema = z
  .union([
    z.null(),
    z
      .object({
        lastRun: z.union([z.string(), z.record(z.string(), z.unknown()), z.null()]).optional(),
        lastRunAt: z.union([z.string(), z.record(z.string(), z.unknown()), z.null()]).optional(),
        status: z.string().optional(),
      })
      .passthrough(),
  ])
  .optional();

export const runSyncResponseSchema = z
  .object({
    message: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough();

export type LastRunResponse = z.infer<typeof lastRunResponseSchema>;
