import React from "react";
import LegixStadisticsContainer from "./components/LegixStadisticsContainer";
import TableRequestsContainer from "./components/TableRequests/TableRequestsContainer";

export default function Requests() {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-white pl-8 mb-4">
        Estadísticas de LEGIX
      </h1>
      <TableRequestsContainer />
      <LegixStadisticsContainer />
    </div>
  );
}
