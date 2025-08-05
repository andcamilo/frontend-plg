"use client";

import TableRequests from "./TableRequests";
import TableRequestsSkeleton from "./TableRequestsSkeleton";
import { useAlertsAndSolicitudes } from "../../hooks/useAlerts&Solicitudes.query";
import { SortProvider } from "../../contexts/SortContext";
import { useSortContext } from "../../hooks/useSortContext.hook";
import { sortSolicitudesByReminder } from "../../utils/sort-solicitudes-by-reminder.util";
import { useMemo } from "react";

const TableRequestsWithSort = () => {
  const { solicitudes, isLoading, isError, alerts } = useAlertsAndSolicitudes();
  const { sortState } = useSortContext();

  const sortedSolicitudes = useMemo(() => {
    if (!solicitudes || !alerts) return solicitudes;
    return sortSolicitudesByReminder(solicitudes, alerts, sortState.order);
  }, [solicitudes, alerts, sortState.order]);

  if (isLoading) return <TableRequestsSkeleton />;
  if (isError) return <div>Error al cargar las solicitudes</div>;
  if (solicitudes?.length === 0) return <div>No hay solicitudes</div>;

  return <TableRequests solicitudes={sortedSolicitudes} alerts={alerts} />;
};

const TableRequestsContainer = () => {
  return (
    <SortProvider>
      <TableRequestsWithSort />
    </SortProvider>
  );
};

export default TableRequestsContainer;
