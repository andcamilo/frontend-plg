import { z } from "zod";

export const alertsSchema = z.object({
  date: z.date(),
});

export type AlertsSchema = z.infer<typeof alertsSchema>;
