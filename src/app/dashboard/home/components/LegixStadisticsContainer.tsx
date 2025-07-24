"use client";
import { usePaginatedSolicitudes } from "../hooks/usePaginatedSolicitudes.query";
import { useUserCuenta } from "../hooks/useUserCuenta.query";
import { useAllSolicitudes } from "../hooks/useAllSolicitudes.query";
import LegixStatistics from "./LegixStadistics";

const LegixStadisticsContainer = () => {
  const { data: userCuenta, isLoading, isError } = useUserCuenta();
  const {
    data: paginatedSolicitudes,
    isLoading: isLoadingPaginatedSolicitudes,
    isError: isErrorPaginatedSolicitudes,
  } = usePaginatedSolicitudes();
  const {
    data: allSolicitudes,
    isLoading: isLoadingAllSolicitudes,
    isError: isErrorAllSolicitudes,
  } = useAllSolicitudes(paginatedSolicitudes?.pagination || {});

  if (isLoading || isLoadingPaginatedSolicitudes || isLoadingAllSolicitudes) {
    return <div>Cargando...</div>;
  }

  if (isError || isErrorPaginatedSolicitudes || isErrorAllSolicitudes) {
    return <div>Error al cargar los datos</div>;
  }

  return (
    <>
      <LegixStatistics
        rol={userCuenta?.rol || 0}
        pagination={paginatedSolicitudes?.pagination || {}}
        allSolicitudes={allSolicitudes?.allSolicitudes || []}
        statusCounts={allSolicitudes?.statusCounts || {}}
        months={allSolicitudes?.months || {}}
      />
    </>
  );
};

export default LegixStadisticsContainer;
