import { ReminderUnit, reminderUnitLabels } from "../schemas/alerts.schema";

/**
 * Convierte un valor y unidad de tiempo a una cadena legible
 * @param value - El valor numérico del tiempo
 * @param unit - La unidad de tiempo
 * @returns Una cadena legible como "2 días", "1 semana", etc.
 */
export const formatAlertTime = (value: number, unit: ReminderUnit): string => {
  const unitLabel = reminderUnitLabels[unit];

  // Para el caso singular
  if (value === 1) {
    const singularLabels: Record<ReminderUnit, string> = {
      hours: "Hora",
      days: "Día",
      weeks: "Semana",
      months: "Mes",
    };
    return `1 ${singularLabels[unit]}`;
  }

  return `${value} ${unitLabel}`;
};

/**
 * Obtiene una descripción completa de la alerta
 * @param value - El valor numérico del tiempo
 * @param unit - La unidad de tiempo
 * @returns Una descripción completa como "Recordatorio en 2 días"
 */
export const getAlertDescription = (
  value: number,
  unit: ReminderUnit
): string => {
  return `Recordatorio en ${formatAlertTime(value, unit)}`;
};

/**
 * Obtiene un color CSS basado en el tiempo de la alerta (para indicadores visuales)
 * @param value - El valor numérico del tiempo
 * @param unit - La unidad de tiempo
 * @returns Una clase CSS de color
 */
export const getAlertColorClass = (
  value: number,
  unit: ReminderUnit
): string => {
  // Convertir todo a horas para comparación fácil
  let hoursTotal: number;

  switch (unit) {
    case "hours":
      hoursTotal = value;
      break;
    case "days":
      hoursTotal = value * 24;
      break;
    case "weeks":
      hoursTotal = value * 24 * 7;
      break;
    case "months":
      hoursTotal = value * 24 * 30;
      break;
    default:
      hoursTotal = value * 24; // fallback a días
  }

  // Clasificar por urgencia
  if (hoursTotal <= 24) {
    return "text-red-600 bg-red-50 border-red-200"; // Muy urgente (24h o menos)
  } else if (hoursTotal <= 72) {
    return "text-orange-600 bg-orange-50 border-orange-200"; // Urgente (3 días o menos)
  } else if (hoursTotal <= 168) {
    return "text-yellow-600 bg-yellow-50 border-yellow-200"; // Moderado (1 semana o menos)
  } else {
    return "text-blue-600 bg-blue-50 border-blue-200"; // Relajado (más de 1 semana)
  }
};
