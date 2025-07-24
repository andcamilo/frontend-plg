import { solicitudesFiltradas } from "./solicitudes-filtradas.util";

export const tipoCountsFiltradosUtil = (allSolicitudes: any[], formData: any) => {
  const tipoCountsFiltrados: { [key: string]: number } = {};
  solicitudesFiltradas(allSolicitudes, formData).forEach((solicitud) => {
    tipoCountsFiltrados[solicitud.tipo] =
      (tipoCountsFiltrados[solicitud.tipo] || 0) + 1;
  });
  console.log("Tipo counts filtrados", tipoCountsFiltrados);
  return tipoCountsFiltrados;
};
