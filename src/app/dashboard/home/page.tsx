import React from "react";
import LegixStadisticsContainer from "./components/LegixStadisticsContainer";
import TableRequestsContainer from "./components/TableRequests/TableRequestsContainer";
import { Modal } from "@app/(global)/components/Modal";
import AlertFormEdit from "./components/Alerts/AlertFormEdit";
import AlertFormCreate from "./components/Alerts/AlertFormCreate";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-white pl-8 mb-4">
        Estadísticas de LEGIX
      </h1>
      <TableRequestsContainer />
      <LegixStadisticsContainer />
      <Modal modalId="alert-form-edit">
        <AlertFormEdit />
      </Modal>
      <Modal modalId="alert-form-create">
        <AlertFormCreate />
      </Modal>
    </div>
  );
}
