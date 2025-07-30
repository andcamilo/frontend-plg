import { z } from "zod";

export const reminderUnits = ["hours", "days", "weeks", "months"] as const;
export type ReminderUnit = (typeof reminderUnits)[number];

export const reminderUnitLabels: Record<ReminderUnit, string> = {
  hours: "Horas",
  days: "Días",
  weeks: "Semanas",
  months: "Meses",
};

export const alertsInputSchema = z.object({
  reminderValue: z
    .string()
    .min(1, { message: "El valor debe ser mayor a 0" })
    .max(3, { message: "El valor debe tener máximo 3 dígitos" })
    .refine((val) => !isNaN(parseInt(val)), {
      message: "Debe ser un número válido",
    })
    .refine((val) => parseInt(val) > 0, {
      message: "El valor debe ser mayor a 0",
    })
    .refine((val) => parseInt(val) <= 999, {
      message: "El valor debe ser menor a 1000",
    }),
  reminderUnit: z.enum(reminderUnits, {
    message: "Debe seleccionar una unidad de tiempo válida",
  }),
  id: z.string().optional(),
});

export const alertsSchema = z.object({
  reminderValue: z.number().min(1).max(999),
  reminderUnit: z.enum(reminderUnits),
  id: z.string().optional(),
});

export type AlertsInputSchema = z.infer<typeof alertsInputSchema>;
export type AlertsSchema = z.infer<typeof alertsSchema>;
