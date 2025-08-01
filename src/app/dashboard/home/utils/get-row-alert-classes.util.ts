import { Alert } from "../types/alert.types";

/**
 * Obtiene las clases CSS para el color de fondo de la fila basado en el estado de la alerta
 * @param alert - La alerta de la solicitud
 * @returns Clases CSS para el color de fondo con opacidad reducida
 */
export const getRowAlertClasses = (alert: Alert | undefined): string => {
  if (!alert) {
    return ""; // Sin alerta, sin color de fondo
  }

  if (alert.isOverdue) {
    return "bg-red-500/5"; // Alerta vencida: rojo con muy baja opacidad
  }

  // Convertir todo a días para hacer la comparación
  let equivalentDays = alert.timeRemainingValue;

  switch (alert.timeRemainingUnit) {
    case "minutes":
      equivalentDays = alert.timeRemainingValue / (60 * 24); // minutos a días
      break;
    case "hours":
      equivalentDays = alert.timeRemainingValue / 24; // horas a días
      break;
    case "days":
      equivalentDays = alert.timeRemainingValue;
      break;
    case "weeks":
      equivalentDays = alert.timeRemainingValue * 7; // semanas a días
      break;
    case "months":
      equivalentDays = alert.timeRemainingValue * 30; // meses a días (aproximado)
      break;
    case "years":
      equivalentDays = alert.timeRemainingValue * 365; // años a días (aproximado)
      break;
    default:
      equivalentDays = alert.timeRemainingValue;
  }

  // Aplicar la lógica de colores con opacidad muy baja para el fondo de la fila
  if (equivalentDays <= 1) {
    return "bg-red-500/5"; // Menor o igual a 1 día: rojo con muy baja opacidad
  } else if (equivalentDays > 1 && equivalentDays < 3) {
    return "bg-yellow-500/5"; // Mayor a 1 día y menor a 3: amarillo con muy baja opacidad
  } else {
    return "bg-green-500/5"; // Mayor o igual a 3 días: verde con muy baja opacidad
  }
}; 