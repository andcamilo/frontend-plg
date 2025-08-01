import React from "react";
import TableRequestsContainer from "./components/TableRequests/TableRequestsContainer";
import { Modal } from "@app/(global)/components/Modal";
import AlertFormEdit from "./components/Alerts/AlertFormEdit";
import AlertFormCreate from "./components/Alerts/AlertFormCreate";
import {
  MODAL_ALERT_CREATE_ID,
  MODAL_ALERT_EDIT_ID,
} from "./constants/modal-alert.constant";
import NotificationsButton from "@app/(global)/components/Notifications/NotificationsButton";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center my-8">
        <h1 className="text-4xl font-bold text-white">Estadísticas de LEGIX</h1>
        <div className="flex items-center gap-4">
          <NotificationsButton />
        </div>
      </div>
      <TableRequestsContainer />
      <Modal modalId={MODAL_ALERT_EDIT_ID}>
        <AlertFormEdit />
      </Modal>
      <Modal modalId={MODAL_ALERT_CREATE_ID}>
        <AlertFormCreate />
      </Modal>
    </div>
  );
}
