import { solicitudesFiltradas } from "./solicitudes-filtradas.util";

export const solicitudEnProceso = (allSolicitudes: any[], formData: any) => {
  return solicitudesFiltradas(allSolicitudes, formData).filter((solicitud) => {
    const status = parseInt(solicitud.status);
    return status !== 70 && status !== 1;
  }).length;
};
