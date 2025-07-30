"use client";
import AlertButtonEdit from "./AlertButtonEdit";
import AlertButtonCreate from "./AlertButtonCreate";
import { useAlertBySolicitudID } from "../../../hooks/Alerts/useAlerts.query";

const AlertButton = ({ idSolicitud }: { idSolicitud: string }) => {
  const { data: alert, isLoading, error } = useAlertBySolicitudID(idSolicitud);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!alert) return <AlertButtonCreate idSolicitud={idSolicitud} />;

  return (
    <>
      <AlertButtonEdit
        reminderValue={alert.reminderValue}
        reminderUnit={alert.reminderUnit}
        idSolicitud={idSolicitud}
      />
    </>
  );
};

export default AlertButton;
