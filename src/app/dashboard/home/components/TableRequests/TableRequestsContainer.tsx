"use client";

import { useAllSolicitudes } from "../../hooks/useAllSolicitudes.query";
import TableRequests from "./TableRequests";

const TableRequestsContainer = () => {
  const { data: solicitudes, isLoading, isError } = useAllSolicitudes();

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar las solicitudes</div>;
  if (solicitudes?.length === 0) return <div>No hay solicitudes</div>;

  return (
    <>
      <TableRequests solicitudes={solicitudes} />
    </>
  );
};

export default TableRequestsContainer;
