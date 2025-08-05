"use client";

import TableRequests from "./TableRequests";
import TableRequestsSkeleton from "./TableRequestsSkeleton";
import { useAlertsAndSolicitudes } from "../../hooks/useAlerts&Solicitudes.query";
import { SortProvider } from "../../contexts/SortContext";
import { useSortContext } from "../../hooks/useSortContext.hook";
import { sortSolicitudesByReminder } from "../../utils/sort-solicitudes-by-reminder.util";
import { sortSolicitudesByDate } from "../../utils/sort-solicitudes-by-date.util";
import { filterSolicitudesByDate } from "../../utils/filter-solicitudes-by-date.util";
import { useMemo } from "react";

const TableRequestsWithSort = () => {
  const { solicitudes, isLoading, isError, alerts } = useAlertsAndSolicitudes();
  const { sortState, filterState } = useSortContext();

  const processedSolicitudes = useMemo(() => {
    if (!solicitudes || !alerts) return solicitudes;

    let filteredSolicitudes = filterSolicitudesByDate(
      solicitudes,
      filterState.dateFilter
    );

    if (sortState.field === "reminder") {
      return sortSolicitudesByReminder(
        filteredSolicitudes,
        alerts,
        sortState.order
      );
    } else if (sortState.field === "date") {
      return sortSolicitudesByDate(filteredSolicitudes, sortState.order);
    }

    return filteredSolicitudes;
  }, [
    solicitudes,
    alerts,
    sortState.field,
    sortState.order,
    filterState.dateFilter,
  ]);

  if (isLoading) return <TableRequestsSkeleton />;
  if (isError) return <div>Error al cargar las solicitudes</div>;
  if (solicitudes?.length === 0) return <div>No hay solicitudes</div>;

  return (
    <>
      <TableRequests solicitudes={processedSolicitudes} alerts={alerts} />
    </>
  );
};

const TableRequestsContainer = () => {
  return (
    <SortProvider>
      <TableRequestsWithSort />
    </SortProvider>
  );
};

export default TableRequestsContainer;
