import { ReminderUnit } from "../schemas/alerts.schema";

/**
 * Convierte el valor de tiempo a minutos
 * @param value - El valor numérico del tiempo
 * @param unit - La unidad de tiempo
 * @returns El valor convertido a minutos
 */
export const convertToMinutes = (value: number, unit: ReminderUnit): number => {
  switch (unit) {
    case "hours":
      return value * 60;
    case "days":
      return value * 60 * 24;
    case "weeks":
      return value * 60 * 24 * 7;
    case "months":
      return value * 60 * 24 * 30; // Aproximadamente 30 días por mes
    default:
      throw new Error(`Unidad de tiempo no válida: ${unit}`);
  }
};

/**
 * Convierte minutos a la unidad de tiempo especificada
 * @param minutes - Los minutos a convertir
 * @param unit - La unidad de tiempo objetivo
 * @returns El valor convertido a la unidad especificada
 */
export const convertFromMinutes = (
  minutes: number,
  unit: ReminderUnit
): number => {
  switch (unit) {
    case "hours":
      return Math.round(minutes / 60);
    case "days":
      return Math.round(minutes / (60 * 24));
    case "weeks":
      return Math.round(minutes / (60 * 24 * 7));
    case "months":
      return Math.round(minutes / (60 * 24 * 30));
    default:
      throw new Error(`Unidad de tiempo no válida: ${unit}`);
  }
};

/**
 * Determina la mejor unidad de tiempo para mostrar un valor en minutos
 * @param minutes - Los minutos a convertir
 * @returns Un objeto con el valor y la unidad más apropiada
 */
export const getBestTimeUnit = (
  minutes: number
): { value: number; unit: ReminderUnit } => {
  const monthsValue = minutes / (60 * 24 * 30);
  const weeksValue = minutes / (60 * 24 * 7);
  const daysValue = minutes / (60 * 24);
  const hoursValue = minutes / 60;

  if (monthsValue >= 1 && monthsValue === Math.round(monthsValue)) {
    return { value: Math.round(monthsValue), unit: "months" };
  }

  if (weeksValue >= 1 && weeksValue === Math.round(weeksValue)) {
    return { value: Math.round(weeksValue), unit: "weeks" };
  }

  if (daysValue >= 1 && daysValue === Math.round(daysValue)) {
    return { value: Math.round(daysValue), unit: "days" };
  }

  return { value: Math.round(hoursValue), unit: "hours" };
};
