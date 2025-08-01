"use client";

import TableRequests from "./TableRequests";
import TableRequestsSkeleton from "./TableRequestsSkeleton";
import { useAlertsAndSolicitudes } from "../../hooks/useAlerts&Solicitudes.query";

const TableRequestsContainer = () => {
  const { solicitudes, isLoading, isError, alerts } = useAlertsAndSolicitudes();

  if (isLoading) return <TableRequestsSkeleton />;
  if (isError) return <div>Error al cargar las solicitudes</div>;
  if (solicitudes?.length === 0) return <div>No hay solicitudes</div>;

  console.log("alerts", alerts);

  return (
    <>
      <TableRequests solicitudes={solicitudes} alerts={alerts} />
    </>
  );
};

export default TableRequestsContainer;
