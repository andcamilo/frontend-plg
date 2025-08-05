import { Solicitud } from "../types/solicitud.types";
import { DateFilter } from "../contexts/SortContext";

/**
 * Filtra las solicitudes por el período de tiempo especificado
 * @param solicitudes - Array de solicitudes
 * @param dateFilter - Filtro de fecha ('all' | 'last_month' | 'last_year')
 * @returns Array de solicitudes filtradas
 */
export const filterSolicitudesByDate = (
  solicitudes: Solicitud[],
  dateFilter: DateFilter
): Solicitud[] => {
  if (dateFilter === "all") return solicitudes;

  const now = new Date();
  let cutoffDate: Date;

  switch (dateFilter) {
    case "last_month":
      cutoffDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      break;
    case "last_year":
      cutoffDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      break;
    default:
      return solicitudes;
  }

  return solicitudes.filter((solicitud) => {
    // Convertir timestamp de Firebase a Date
    const solicitudDate = new Date(
      solicitud.date._seconds * 1000 + solicitud.date._nanoseconds / 1000000
    );
    return solicitudDate >= cutoffDate;
  });
};
