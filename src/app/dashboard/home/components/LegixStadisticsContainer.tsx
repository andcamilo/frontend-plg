"use client";
import { useUserCuenta } from "../hooks/useUserCuenta.query";
import LegixStatistics from "./LegixStadistics";

const LegixStadisticsContainer = () => {
  const { data: userCuenta, isLoading, isError } = useUserCuenta();

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
