"use client";

import { useState, useMemo } from "react";
import { useAllSolicitudes } from "../../hooks/useAllSolicitudes.query";
import TableRequests from "./TableRequests";
import { Solicitud, AbogadoFilter } from "../../types/solicitud.types";

const TableRequestsContainer = () => {
  const [selectedAbogado, setSelectedAbogado] = useState<AbogadoFilter | null>(
    null
  );

  const {
    data: solicitudes,
    isLoading,
    isError,
  } = useAllSolicitudes({
    nextCursor: null,
  });

  // Obtener lista única de abogados
  const abogadosDisponibles = useMemo(() => {
    if (!solicitudes?.allSolicitudes) return [];

    const abogadosMap = new Map<string, AbogadoFilter>();

    solicitudes.allSolicitudes.forEach((solicitud: Solicitud) => {
      if (solicitud.abogados && solicitud.abogados.length > 0) {
        solicitud.abogados.forEach((abogado) => {
          if (!abogadosMap.has(abogado.id)) {
            abogadosMap.set(abogado.id, {
              id: abogado.id,
              nombre: abogado.nombre,
            });
          }
        });
      }
    });

    return Array.from(abogadosMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [solicitudes?.allSolicitudes]);

  // Filtrar solicitudes por abogado seleccionado
  const solicitudesFiltradas = useMemo(() => {
    if (!solicitudes?.allSolicitudes) return [];
    if (!selectedAbogado) return solicitudes.allSolicitudes;

    return solicitudes.allSolicitudes.filter((solicitud: Solicitud) => {
      return solicitud.abogados?.some(
        (abogado) => abogado.id === selectedAbogado.id
      );
    });
  }, [solicitudes?.allSolicitudes, selectedAbogado]);

  const handleFilterByAbogado = (abogado: AbogadoFilter | null) => {
    setSelectedAbogado(abogado);
  };

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar las solicitudes</div>;
  if (solicitudes?.allSolicitudes.length === 0)
    return <div>No hay solicitudes</div>;

  return (
    <>
      {/* Indicador de filtro y contador */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            Mostrando {solicitudesFiltradas.length} de{" "}
            {solicitudes?.allSolicitudes.length} solicitudes
          </span>
          {selectedAbogado && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Filtrado por:</span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {selectedAbogado.nombre}
              </span>
              <button
                onClick={() => handleFilterByAbogado(null)}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Limpiar filtro
              </button>
            </div>
          )}
        </div>
      </div>

      <TableRequests
        solicitudes={solicitudesFiltradas}
        abogadosDisponibles={abogadosDisponibles}
        selectedAbogado={selectedAbogado}
        onFilterByAbogado={handleFilterByAbogado}
      />
    </>
  );
};

export default TableRequestsContainer;
