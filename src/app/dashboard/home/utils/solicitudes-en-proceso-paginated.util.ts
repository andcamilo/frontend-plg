import { solicitudesEnProceso } from "./solicitudes-en-proceso.util";

export const paginatedSolicitudesEnProceso = (
  allSolicitudes: any[],
  formData: any,
  currentPageEnProceso: number,
  rowsPerPage: number
) => {
  return solicitudesEnProceso(allSolicitudes, formData).slice(
    (currentPageEnProceso - 1) * rowsPerPage,
    currentPageEnProceso * rowsPerPage
  );
};
