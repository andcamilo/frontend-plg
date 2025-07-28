import Table from "../Table/Table";
import Thead from "../Table/Thead";
import Tbody from "../Table/Tbody";
import Th from "../Table/Th";
import Td from "../Table/Td";
import Tr from "../Table/Tr";
import { getStatusInfo } from "../../utils/status-info.util";

function formatDate(dateObj: any) {
  if (!dateObj || typeof dateObj !== "object") return "-";
  try {
    const d = new Date(dateObj._seconds * 1000);
    return d.toLocaleDateString("es-PA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

const TableRequests = ({ solicitudes }: { solicitudes: any[] }) => {
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
                    <div className="font-medium">
                      {solicitud.tipoConsulta || solicitud.tipo || "-"}
                    </div>
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
                  <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                    1 Día
                  </span>
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
                  <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                    María t.
                  </span>
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
