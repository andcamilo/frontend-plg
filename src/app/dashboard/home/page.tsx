import React from "react";
import LegixStadisticsContainer from "./components/LegixStadisticsContainer";
import TableRequestsContainer from "./components/TableRequests/TableRequestsContainer";
import { Modal } from "@app/(global)/components/Modal";
import AlertFormEdit from "./components/Alerts/AlertFormEdit";
import AlertFormCreate from "./components/Alerts/AlertFormCreate";
import {
  MODAL_ALERT_CREATE_ID,
  MODAL_ALERT_EDIT_ID,
} from "./constants/modal-alert.constant";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-white pl-8 mb-4">
        Estadísticas de LEGIX
      </h1>
      <TableRequestsContainer />
      <LegixStadisticsContainer />
      <Modal modalId={MODAL_ALERT_EDIT_ID}>
        <AlertFormEdit />
      </Modal>
      <Modal modalId={MODAL_ALERT_CREATE_ID}>
        <AlertFormCreate />
      </Modal>
    </div>
  );
}
