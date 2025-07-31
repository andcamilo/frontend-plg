import { solicitudesFinalizadas } from "./solicitudes-finalizadas.util";

export const paginatedSolicitudesFinalizadas = (
  allSolicitudes: any[],
  formData: any,
  currentPageFinalizadas: number,
  rowsPerPage: number
) => {
  return solicitudesFinalizadas(allSolicitudes, formData).slice(
    (currentPageFinalizadas - 1) * rowsPerPage,
    currentPageFinalizadas * rowsPerPage
  );
};
