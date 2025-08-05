import { Solicitud } from "../types/solicitud.types";
import { SortOrder } from "../contexts/SortContext";

export const sortSolicitudesByDate = (
  solicitudes: Solicitud[],
  order: SortOrder
): Solicitud[] => {
  if (!order) return solicitudes;

  return [...solicitudes].sort((a, b) => {
    const dateA = a.date._seconds * 1000 + a.date._nanoseconds / 1000000;
    const dateB = b.date._seconds * 1000 + b.date._nanoseconds / 1000000;

    if (order === "asc") {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });
};
