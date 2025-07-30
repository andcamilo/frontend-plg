import { useState, useRef, useEffect } from "react";
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
import { Solicitud, AbogadoFilter } from "../../types/solicitud.types";

interface TableRequestsProps {
  solicitudes: Solicitud[];
  abogadosDisponibles: AbogadoFilter[];
  selectedAbogado: AbogadoFilter | null;
  onFilterByAbogado: (abogado: AbogadoFilter | null) => void;
}

const TableRequests = ({
  solicitudes,
  abogadosDisponibles,
  selectedAbogado,
  onFilterByAbogado,
}: TableRequestsProps) => {
  const [showAbogadosDropdown, setShowAbogadosDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAbogadosDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAbogadoHeaderClick = () => {
    setShowAbogadosDropdown(!showAbogadosDropdown);
  };

  const handleAbogadoSelect = (abogado: AbogadoFilter | null) => {
    onFilterByAbogado(abogado);
    setShowAbogadosDropdown(false);
  };

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
          <Th>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleAbogadoHeaderClick}
                className="flex items-center gap-2 hover:bg-gray-700/50 p-2 rounded transition-colors"
              >
                Abogados
                <span className="text-xs">
                  {showAbogadosDropdown ? "▼" : "▶"}
                </span>
                {selectedAbogado && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                    {selectedAbogado.nombre}
                  </span>
                )}
              </button>

              {showAbogadosDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 min-w-48 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => handleAbogadoSelect(null)}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors ${
                        !selectedAbogado
                          ? "bg-purple-500/20 text-purple-300"
                          : "text-gray-300"
                      }`}
                    >
                      Todos los abogados
                    </button>
                    {abogadosDisponibles.map((abogado) => (
                      <button
                        key={abogado.id}
                        onClick={() => handleAbogadoSelect(abogado)}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors ${
                          selectedAbogado?.id === abogado.id
                            ? "bg-purple-500/20 text-purple-300"
                            : "text-gray-300"
                        }`}
                      >
                        {abogado.nombre}
                      </button>
                    ))}
                    {abogadosDisponibles.length === 0 && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No hay abogados disponibles
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Th>
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
