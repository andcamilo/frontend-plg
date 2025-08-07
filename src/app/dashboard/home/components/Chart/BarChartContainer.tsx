"use client";
import BarChart from "./BarChart";
import { useAllSolicitudes } from "../../hooks/useAllSolicitudes.query";
import { formatDate } from "../../utils/format-date-dd-mm-aaaa.util";
import BarChartSkeleton from "./BarChartSkeleton";

const BarChartContainer = () => {
  const { data: solicitudes, isLoading, isError } = useAllSolicitudes();

  if (isLoading) return <BarChartSkeleton />;
  if (isError) return <div>Error al cargar las solicitudes</div>;

  const solicitudesPorMes = solicitudes?.reduce((acc, solicitud) => {
    const month = new Date(formatDate(solicitud.date)).getMonth();
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(solicitudesPorMes).map(
    ([month, solicitudes]) => ({
      month: new Date(2024, Number(month), 1).toLocaleString("es-ES", {
        month: "long",
      }),
      solicitudes: Number(solicitudes),
    })
  );

  return <BarChart data={data} />;
};

export default BarChartContainer;
