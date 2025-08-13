import { formatDate } from "./format-date.util";
import { solicitudesFiltradas } from "./solicitudes-filtradas.util";
import { STATUS_CLASSES } from "../constants/status-classes.constant";
import { STATUS_MAPPING } from "../../../(global)/constants/status-mapping.constant";
import { TIPO_MAPPING } from "../constants/tipo-mapping.constant";

export const solicitudesEnProceso = (allSolicitudes: any[], formData: any) => {
  return solicitudesFiltradas(allSolicitudes, formData)
    .filter((solicitud) => parseInt(solicitud.status) !== 70)
    .map(({ tipo, emailSolicita, date, status }) => ({
      Tipo: TIPO_MAPPING[tipo] || tipo,
      Fecha: formatDate(date),
      Email: emailSolicita,
      Estatus: (
        <span className={`status-badge ${STATUS_CLASSES[status]}`}>
          {STATUS_MAPPING[status]}
        </span>
      ),
    }));
};
