import { Solicitud } from "../../request/[id]/types/solicitud.types";
import { Alert } from "../types/alert.types";
import { SortOrder } from "../contexts/SortContext";

/**
 * Ordena las solicitudes por recordatorio basándose en las alertas
 * @param solicitudes - Array de solicitudes
 * @param alerts - Array de alertas
 * @param order - Orden de ordenamiento ('asc' | 'desc')
 * @returns Array de solicitudes ordenadas
 */
export const sortSolicitudesByReminder = (
  solicitudes: Solicitud[],
  alerts: Alert[],
  order: SortOrder
): Solicitud[] => {
  if (!order) return solicitudes;

  return [...solicitudes].sort((a, b) => {
    const alertA = alerts.find((alert) => alert.solicitudId === a.id);
    const alertB = alerts.find((alert) => alert.solicitudId === b.id);

    // Función para obtener el valor de ordenamiento de una alerta
    const getSortValue = (alert: Alert | undefined): number => {
      if (!alert) {
        // Las solicitudes sin alerta van al final
        return order === "asc"
          ? Number.MAX_SAFE_INTEGER
          : Number.MIN_SAFE_INTEGER;
      }

      if (alert.isOverdue) {
        // Las alertas vencidas tienen prioridad máxima en ascendente, mínima en descendente
        return order === "asc"
          ? -Number.MAX_SAFE_INTEGER
          : Number.MAX_SAFE_INTEGER;
      }

      // Usar totalMillisecondsRemaining para ordenar
      return alert.totalMillisecondsRemaining;
    };

    const valueA = getSortValue(alertA);
    const valueB = getSortValue(alertB);

    if (order === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });
};
