"use client";

import { useAllSolicitudes } from "../../hooks/useAllSolicitudes.query";
import TableRequests from "./TableRequests";
import TableRequestsSkeleton from "./TableRequestsSkeleton";

const TableRequestsContainer = () => {
  const { data: solicitudes, isLoading, isError } = useAllSolicitudes();

  if (isLoading) return <TableRequestsSkeleton />;
  if (isError) return <div>Error al cargar las solicitudes</div>;
  if (solicitudes?.length === 0) return <div>No hay solicitudes</div>;

  return (
    <>
      <TableRequests solicitudes={solicitudes} />
    </>
  );
};

export default TableRequestsContainer;
