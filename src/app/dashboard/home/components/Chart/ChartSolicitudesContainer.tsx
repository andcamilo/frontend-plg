"use client";
import ChartSolicitudes from "./ChartSolicitudes";
import { useAllSolicitudes } from "../../hooks/useAllSolicitudes.query";
import { STATUS_MAPPING } from "../../constants/status-mapping.constant";
import CircularChartSkeleton from "./CircularChartSkeleton";

const ChartSolicitudesContainer = () => {
  const { data: solicitudes, isLoading, isError } = useAllSolicitudes();

  if (isLoading) return <CircularChartSkeleton />;
  if (isError) return <div>Error al cargar las solicitudes</div>;

  const finalizadaStatus = Object.keys(STATUS_MAPPING).find(
    (key) => STATUS_MAPPING[Number(key)] === "Finalizada"
  );
  const finalizadaStatusNum = finalizadaStatus
    ? Number(finalizadaStatus)
    : null;

  const solicitudesFinalizadas = solicitudes?.filter(
    (solicitud) => solicitud.status === finalizadaStatusNum
  ).length;

  const solicitudesEnProgreso = solicitudes?.filter(
    (solicitud) => solicitud.status !== finalizadaStatusNum
  ).length;

  return (
    <ChartSolicitudes
      solicitudesEnProgreso={solicitudesEnProgreso}
      solicitudesFinalizadas={solicitudesFinalizadas}
    />
  );
};

export default ChartSolicitudesContainer;
