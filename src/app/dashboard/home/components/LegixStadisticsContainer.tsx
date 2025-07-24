"use client";
import { usePaginatedSolicitudes } from "../hooks/usePaginatedSolicitudes.query";
import { useUserCuenta } from "../hooks/useUserCuenta.query";
import LegixStatistics from "./LegixStadistics";

const LegixStadisticsContainer = () => {
  const { data: userCuenta, isLoading, isError } = useUserCuenta();
  const {
    data: paginatedSolicitudes,
    isLoading: isLoadingPaginatedSolicitudes,
    isError: isErrorPaginatedSolicitudes,
  } = usePaginatedSolicitudes();

  if (isLoading || isLoadingPaginatedSolicitudes) {
    return <div>Cargando...</div>;
  }

  if (isError || isErrorPaginatedSolicitudes) {
    return <div>Error al cargar los datos</div>;
  }

  return (
    <>
      <LegixStatistics
        rol={userCuenta?.rol || 0}
        pagination={paginatedSolicitudes?.pagination || {}}
      />
    </>
  );
};

export default LegixStadisticsContainer;
