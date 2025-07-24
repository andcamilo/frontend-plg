"use client";
import { useUserCuentaQuery } from "../hooks/useUserCuenta.query";
import LegixStatistics from "./LegixStadistics";

const LegixStadisticsContainer = () => {
  const { data: userCuenta, isLoading, isError } = useUserCuentaQuery();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (isError) {
    return <div>Error al cargar los datos</div>;
  }

  return (
    <>
      <LegixStatistics rol={userCuenta?.rol || 0} />
    </>
  );
};

export default LegixStadisticsContainer;
