import React from "react";
import LegixStadisticsContainer from "./components/LegixStadisticsContainer";

export default function Requests() {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-white pl-8 mb-4">
        Estadísticas de LEGIX
      </h1>
      <LegixStadisticsContainer />
    </div>
  );
}
