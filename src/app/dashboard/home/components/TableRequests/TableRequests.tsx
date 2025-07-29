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

const TableRequests = ({ solicitudes }: { solicitudes: Solicitud[] }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <Thead>
          <Th>Tipo trámite</Th>
          <Th>Fecha de creación</Th>
          <Th>Status</Th>
          <Th>ID</Th>
          <Th>Acciones</Th>
          <Th>Recordatorio</Th>
          <Th>Fecha de corte</Th>
          <Th>Abogado</Th>
        </Thead>
        <Tbody>
          {solicitudes.map((solicitud, idx) => {
            const statusInfo = getStatusInfo(solicitud.status);
            return (
              <Tr key={solicitud.id || idx}>
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
                  <div className="flex gap-1">
                    <button className="text-purple-400 hover:text-purple-300">
                      👁️
                    </button>
                    <button className="text-yellow-400 hover:text-yellow-300">
                      ✏️
                    </button>
                    <button className="text-green-400 hover:text-green-300">
                      ⭐
                    </button>
                  </div>
                </Td>
                <Td>
                  <AlertButton idSolicitud={solicitud.id} />
                </Td>
                <Td>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      statusInfo.color === "red"
                        ? "bg-red-500/20 text-red-300"
                        : statusInfo.color === "yellow"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : statusInfo.color === "green"
                        ? "bg-green-500/20 text-green-300"
                        : statusInfo.color === "blue"
                        ? "bg-blue-500/20 text-blue-300"
                        : statusInfo.color === "purple"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    27-05-2025
                  </span>
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
