import Table from "@/src/app/(global)/components/Table/Table";
import Thead from "@/src/app/(global)/components/Table/Thead";
import Tbody from "@/src/app/(global)/components/Table/Tbody";
import Th from "@/src/app/(global)/components/Table/Th";
import Td from "@/src/app/(global)/components/Table/Td";
import Tr from "@/src/app/(global)/components/Table/Tr";
import { getStatusInfo } from "../../utils/status-info.util";
import AlertButton from "./AlertButton/AlertButton";
import { formatDate } from "../../utils/format-date-dd-mm-aaaa.util";
import AbogadosField from "./AbogadosField";
import { Solicitud } from "../../types/solicitud.types";

interface TableRequestsProps {
  solicitudes: Solicitud[];
}

const TableRequests = ({ solicitudes }: TableRequestsProps) => {
  return (
    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
      <Table>
        <Thead>
          <Th>Tipo trámite</Th>
          <Th>Fecha de creación</Th>
          <Th>Status</Th>
          <Th>ID</Th>
          <Th>Recordatorio</Th>
          <Th>Abogados</Th>
        </Thead>
        <Tbody>
          {solicitudes.map((solicitud, idx) => {
            const statusInfo = getStatusInfo(solicitud.status);
            return (
              <Tr key={solicitud.id || idx} className="hover:bg-gray-700">
                <Td>
                  <div>
                    <div className="font-medium">{solicitud.tipo || "-"}</div>
                    <div className="text-gray-400 text-xs">
                      {solicitud.nombreSolicita || solicitud.nombre || "-"}
                    </div>
                  </div>
                </Td>
                <Td>{formatDate(solicitud.date)}</Td>
                <Td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusInfo.color === "red"
                        ? "bg-red-500/20 text-red-400"
                        : statusInfo.color === "yellow"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : statusInfo.color === "green"
                        ? "bg-green-500/20 text-green-400"
                        : statusInfo.color === "blue"
                        ? "bg-blue-500/20 text-blue-400"
                        : statusInfo.color === "purple"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {statusInfo.label}
                  </span>
                </Td>
                <Td>{solicitud.expediente || solicitud.id || "-"}</Td>
                <Td>
                  <AlertButton idSolicitud={solicitud.id} />
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
  );
};

export default TableRequests;
