import { z } from "zod";

export const alertsSchema = z.object({
  date: z
    .string()
    .refine(
      (val) => {
        // Valida formato de fecha
        return !isNaN(Date.parse(val));
      },
      { message: "Fecha inválida" }
    )
    .transform((val) => new Date(val))
    .refine(
      (date) => {
        // Valida que la fecha sea posterior a hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
      },
      { message: "La fecha debe ser posterior a hoy" }
    ),
});

export type AlertsSchema = z.infer<typeof alertsSchema>;
