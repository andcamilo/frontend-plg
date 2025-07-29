import { z } from "zod";

export const alertsSchema = z.object({
  reminderDays: z
    .string()
    .min(1, { message: "El número de días debe ser mayor a 0" })
    .max(30, { message: "El número de días debe ser menor a 30" })
    .transform((val) => parseInt(val)),
});

export type AlertsSchema = z.infer<typeof alertsSchema>;
