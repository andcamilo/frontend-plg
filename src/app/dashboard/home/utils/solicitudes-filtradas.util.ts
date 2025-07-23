import { getSolicitudesFiltradasPorRol } from "./solicitudes-filtradas-por-rol.util";

export const solicitudesFiltradas = (allSolicitudes: any[], formData: any) => {
  return getSolicitudesFiltradasPorRol(allSolicitudes, formData);
};
