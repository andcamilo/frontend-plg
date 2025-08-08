import Table from "@/src/app/(global)/components/Table/Table";
import Thead from "@/src/app/(global)/components/Table/Thead";
import Tbody from "@/src/app/(global)/components/Table/Tbody";
import Th from "@/src/app/(global)/components/Table/Th";
import Td from "@/src/app/(global)/components/Table/Td";
import Tr from "@/src/app/(global)/components/Table/Tr";
import { getStatusInfo } from "../../utils/status-info.util";
import { formatDate } from "../../utils/format-date-dd-mm-aaaa.util";
import AbogadosField from "./AbogadosField";
import { Solicitud } from "../../types/solicitud.types";
import { Alert } from "../../types/alert.types";
import AlertButtonEdit from "./AlertButton/AlertButtonEdit";
import AlertButtonCreate from "./AlertButton/AlertButtonCreate";
import { useSortContext } from "../../hooks/useSortContext.hook";
import { getSortIcon } from "../../utils/get-sort-icon.util";
import { getRowAlertClasses } from "../../utils/get-row-alert-classes.util";
import Status from "./Status";
import SolicitudTipo from "./SolicitudTipo";
import SolicitudNombre from "./SolicitudNombre";
import DateFilter from "../DateFilter/DateFilter";

interface TableRequestsProps {
  solicitudes: Solicitud[];
  alerts: Alert[];
}

const TableRequests = ({ solicitudes, alerts }: TableRequestsProps) => {
  const { sortState, toggleSort } = useSortContext();

  return (
    <>
      <DateFilter />

      <div className="overflow-x-auto max-h-[40vh] overflow-y-auto">
        <Table>
          <Thead>
            <Th>Tipo trámite</Th>
            <Th>
              <button
                onClick={() => toggleSort("date")}
                className="flex items-center hover:text-gray-300 transition-colors"
              >
                Fecha de creación
                {getSortIcon(sortState, "date")}
              </button>
            </Th>
            <Th>Status</Th>
            <Th>ID</Th>
            <Th>
              <button
                onClick={() => toggleSort("reminder")}
                className="flex items-center hover:text-gray-300 transition-colors"
              >
                Recordatorio
                {getSortIcon(sortState, "reminder")}
              </button>
            </Th>
            <Th>Abogados</Th>
          </Thead>
          <Tbody>
            {solicitudes.map((solicitud, idx) => {
              const statusInfo = getStatusInfo(solicitud.status);
              // Encuentra todas las alertas asociadas a esta solicitud
              const solicitudAlerts = alerts.filter(
                (a) => a.solicitudId === solicitud.id
              );

              return (
                <Tr
                  key={solicitud.id || idx}
                  className={`hover:bg-gray-700 transition-colors ${getRowAlertClasses(
                    solicitudAlerts[0]
                  )}`}
                >
                  <Td>
                    <SolicitudTipo tipo={solicitud.tipo} />
                    <SolicitudNombre
                      nombre={solicitud.nombre || solicitud.nombreSolicita}
                    />
                  </Td>
                  <Td>{formatDate(solicitud.date)}</Td>
                  <Td>
                    <Status
                      solicitudId={solicitud.id}
                      statusInfo={statusInfo}
                    />
                  </Td>
                  <Td>{solicitud.expediente || solicitud.id || "-"}</Td>
                  <Td>
                    {solicitudAlerts.length > 0 ? (
                      <div className="flex flex-row flex-wrap gap-1">
                        {solicitudAlerts.map((alert) => (
                          <AlertButtonEdit
                            key={alert.id}
                            alert={alert}
                            idSolicitud={solicitud.id}
                          />
                        ))}
                        <AlertButtonCreate idSolicitud={solicitud.id} />
                      </div>
                    ) : (
                      <AlertButtonCreate idSolicitud={solicitud.id} />
                    )}
                  </Td>
                  <Td>
                    <AbogadosField abogados={solicitud.abogados} />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </div>
    </>
  );
};

export default TableRequests;
