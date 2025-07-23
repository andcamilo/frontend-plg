import { solicitudesFiltradas } from "./solicitudes-filtradas.util";

export const solicitudFinalizada = (allSolicitudes: any[], formData: any) => {
  return solicitudesFiltradas(allSolicitudes, formData).filter(
    (solicitud) => parseInt(solicitud.status) === 70
  ).length;
};
